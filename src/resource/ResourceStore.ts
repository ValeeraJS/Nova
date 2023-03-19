import EventFirer from "@valeera/eventfirer";
import { ILoadItem, ILoadPart, IParser, LoadPartType, LoadType } from "./IResourceItem";

type ToLoadPartRecord = {
	part: ILoadPart,
	belongsTo: ILoadItem<any>,
}

export class ResourceStore extends EventFirer {
	public static readonly WILL_LOAD = "willLoad";
	public static readonly LOADING = "loading";
	public static readonly LOADED = "loaded";
	public static readonly PARSED = "parsed";
	public resourcesMap = new Map<string, Map<string, any>>();

	public loadItems = {
		[LoadType.TEXT]: new Map<string, string>(),
		[LoadType.JSON]: new Map<string, { [key: string]: any }>(),
		[LoadType.ARRAY_BUFFER]: new Map<string, ArrayBuffer>(),
		[LoadType.BLOB]: new Map<string, Blob>(),
	};
	public parsers = new Map<string, IParser<any>>();

	#toLoadStack: ToLoadPartRecord[] = [];
	#loadingTasks: Set<Promise<LoadPartType>> = new Set();

	public maxTasks = 5;

	#loadTagsMap = new Map<ILoadItem<any>, number>();
	#countToParse = 0;
	getResource(name: string, type: string): any {
		const map = this.resourcesMap.get(type);
		if (!map) {
			return null;
		}
		return map.get(name);
	}

	setResource(data: any, type: string, name: string): this {
		let map = this.resourcesMap.get(type);
		if (!map) {
			map = new Map();
			this.resourcesMap.set(type, map);
		}
		map.set(name, data);

		return this;
	}

	loadAndParse = (arr: ILoadItem<LoadPartType>[]) => {
		for (let item of arr) {
			let check = this.getResource(item.name, item.type);
			if (check) {
				// 重复资源不加载
				continue;
			}

			check = this.#loadTagsMap.get(item);
			if (check) {
				// 防止一个资源连续执行多次加载
				continue;
			}

			if (item.loadParts.length) {
				for (let part of item.loadParts) {
					this.#toLoadStack.push({
						part,
						belongsTo: item
					});
				}

				this.#loadTagsMap.set(item, item.loadParts.length);
				this.#countToParse++;
			}
		}


		const toLoadLength = this.#toLoadStack.length

		this.fire(ResourceStore.WILL_LOAD, this);

		for (let i = 0; i < toLoadLength && i < this.maxTasks; i++) {
			const part = this.#toLoadStack.pop();
			let promise = this.#loadPart(part);
			promise.finally(() => {
				this.#loadingTasks.delete(promise);

				if (this.#toLoadStack.length) {
					this.#loadPart(this.#toLoadStack.pop());
				} else {
					this.fire(ResourceStore.LOADED, this);
				}
			});
			this.#loadingTasks.add(promise);
		}
	}

	getUrlLoaded(url: string, type?: LoadType): LoadPartType | null {
		if (type) {
			return this.loadItems[type].get(url);
		}
		let result: LoadPartType = this.loadItems[LoadType.TEXT].get(url);
		if (result) {
			return result;
		}
		result = this.loadItems[LoadType.BLOB].get(url);
		if (result) {
			return result;
		}
		result = this.loadItems[LoadType.ARRAY_BUFFER].get(url);
		if (result) {
			return result;
		} result = this.loadItems[LoadType.JSON].get(url);
		if (result) {
			return result;
		}
		return null;
	}

	#loadPart = (partRecord: ToLoadPartRecord): Promise<LoadPartType> => {
		const part = partRecord.part;
		const len = partRecord.belongsTo.loadParts.length;
		let process = 0;
		const assets = this.getUrlLoaded(part.url, part.type);
		if (assets) {
			return new Promise<LoadPartType>((resolve) => {
				part.onLoad?.(assets);
				resolve(assets);
			});
		}

		return fetch(part.url).then((response) => {
			const { body, headers } = response;
			let size = parseInt(headers.get('content-length'), 10) || 0;
			let currentSize = 0;
			let stream: ReadableStream;

			const reader = body.getReader();
			stream = new ReadableStream({
				start: (controller: ReadableStreamDefaultController) => {
					const push = (reader: ReadableStreamDefaultReader<Uint8Array>) => {
						reader.read().then((res: any) => {
							let currentReadData = res;
							let { done, value } = res;
							if (done) {
								controller.close();
								return;
							} else {
								if (!currentReadData || !currentReadData.value) {
									process = 0;
								} else {
									const arr = currentReadData.value;
									process = arr.length * arr.constructor.BYTES_PER_ELEMENT;
								}
								currentSize += process;
								part.onLoadProgress?.(currentSize, size, process);
								controller.enqueue(value);
							}
							push(reader);
						}).catch((e: any) => {
							part.onLoadError?.(e);
						});
					};
					push(reader);
				},
				cancel: () => {
					part.onCancel?.();
				}
			});

			return new Response(stream, { headers });
		}).then((response) => {
			if (part.type === LoadType.JSON) {
				return response.json();
			}
			if (part.type === LoadType.TEXT) {
				return response.text();
			}
			if (part.type === LoadType.BLOB) {
				return response.blob();
			}
			return response.arrayBuffer();
		}).then((data: any) => {
			part.onLoad?.(data);
			this.loadItems[part.type ?? LoadType.ARRAY_BUFFER].set(part.url, data);
			let count = this.#loadTagsMap.get(partRecord.belongsTo);
			partRecord.belongsTo.onLoadProgress?.(len - count + 1, len);
			if (count < 2) {
				this.#loadTagsMap.delete(partRecord.belongsTo);
				partRecord.belongsTo.onLoad?.();

				this.#parserResource(partRecord.belongsTo);
			} else {
				this.#loadTagsMap.set(partRecord.belongsTo, count - 1);
			}
			return data;
		}).catch((e: any) => {
			part.onLoadError?.(e);
		});
	}

	#parserResource = (resource: ILoadItem<any>) => {
		let parser = this.parsers.get(resource.type);
		if (!parser) {
			resource.onParseError?.(new Error('No parser found: ' + resource.type));
		}

		const data: any = [];
		for (let part of resource.loadParts) {
			data.push(this.getUrlLoaded(part.url, part.type));
		}
		let result = parser(...data);
		if (result instanceof Promise) {
			return result.then((data: any) => {
				this.#checkAllParseAndSetResource(resource, data);
			}).catch((e) => {
				resource.onParseError?.(e);
				this.#countToParse--;
				if (!this.#countToParse) {
					this.fire(ResourceStore.PARSED, this);
				}
			});
		} else {
			this.#checkAllParseAndSetResource(resource, data);
		}

		return this;
	}

	#checkAllParseAndSetResource = (resource: ILoadItem<any>, data: any) => {
		this.setResource(data, resource.type, resource.name);
		resource.onParse?.(data);
		this.#countToParse--;

		if (!this.#countToParse) {
			this.fire(ResourceStore.PARSED, this);
		}
	}

	registerParser(parser: IParser<any>, type: string) {
		this.parsers.set(type, parser);
		return this;
	}
}
