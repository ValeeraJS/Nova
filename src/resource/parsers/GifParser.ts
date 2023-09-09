import { ImageBitmapTexture } from "../../systems/render/texture/ImageBitmapTexture";
import { Texture } from "../../systems/render/texture/Texture";
import { IParser } from "../IResourceItem";

export type GifFrame = {
	x: number;
	y: number;
	width: number;
	height: number;
	has_local_palette: boolean;
	palette_offset: number;
	palette_size: number;
	data_offset: number;
	data_length: number;
	transparent_index: number;
	interlaced: boolean;
	delay: number;
	disposal: number;
};

export const GifParser: IParser<Texture[]> = async (buf: ArrayBuffer) => {
	const buffer = new Uint8Array(buf);
	const result: Texture[] = [];

	let p = 0;
	if (buffer[p++] !== 0x47 || buffer[p++] !== 0x49 || buffer[p++] !== 0x46 ||
		buffer[p++] !== 0x38 || (buffer[p++] + 1 & 0xfd) !== 0x38 || buffer[p++] !== 0x61) {
		throw new Error("Invalid GIF 87a/89a header.");
	}

	const width = buffer[p++] | buffer[p++] << 8;
	const height = buffer[p++] | buffer[p++] << 8;
	const pf0 = buffer[p++];
	const global_palette_flag = pf0 >> 7;
	const num_global_colors_pow2 = pf0 & 0x7;
	const num_global_colors = 1 << (num_global_colors_pow2 + 1);
	const background = buffer[p++];

	buffer[p++];

	let global_palette_offset = null;
	let global_palette_size = null;

	if (global_palette_flag) {
		global_palette_offset = p;
		global_palette_size = num_global_colors;
		p += (num_global_colors << 1) + num_global_colors;  // Seek past palette.
	}

	let no_eof = true;

	const frames: GifFrame[] = [];

	let delay = 0;
	let transparent_index = null;
	let disposal = 0;  // 0 - No disposal specified.
	let loop_count = null;

	while (no_eof && p < buffer.length) {
		switch (buffer[p++]) {
			case 0x21:  // Graphics Control Extension Block
				switch (buffer[p++]) {
					case 0xff:  // Application specific block
						// Try if it's a Netscape block (with animation loop counter).
						if (buffer[p] !== 0x0b ||  // 21 FF already read, check block size.
							// NETSCAPE2.0
							buffer[p + 1] === 0x4e && buffer[p + 2] === 0x45 && buffer[p + 3] === 0x54 &&
							buffer[p + 4] === 0x53 && buffer[p + 5] === 0x43 && buffer[p + 6] === 0x41 &&
							buffer[p + 7] === 0x50 && buffer[p + 8] === 0x45 && buffer[p + 9] === 0x32 &&
							buffer[p + 10] === 0x2e && buffer[p + 11] === 0x30 &&
							// Sub-block
							buffer[p + 12] === 0x03 && buffer[p + 13] === 0x01 && buffer[p + 16] === 0) {
							p += 14;
							loop_count = buffer[p++] | buffer[p++] << 8;
							p++;  // Skip terminator.
						} else {  // We don't know what it is, just try to get past it.
							p += 12;
							while (true) {  // Seek through subblocks.
								const block_size = buffer[p++];
								// Bad block size (ex: undefined from an out of bounds read).
								if (!(block_size >= 0)) throw Error("Invalid block size");
								if (block_size === 0) break;  // 0 size is terminator
								p += block_size;
							}
						}
						break;

					case 0xf9:  // Graphics Control Extension
						if (buffer[p++] !== 0x4 || buffer[p + 4] !== 0)
							throw new Error("Invalid graphics extension block.");
						const pf1 = buffer[p++];
						delay = buffer[p++] | buffer[p++] << 8;
						transparent_index = buffer[p++];
						if ((pf1 & 1) === 0) transparent_index = null;
						disposal = pf1 >> 2 & 0x7;
						p++;  // Skip terminator.
						break;

					// Plain Text Extension could be present and we just want to be able
					// to parse past it.  It follows the block structure of the comment
					// extension enough to reuse the path to skip through the blocks.
					case 0x01:  // Plain Text Extension (fallthrough to Comment Extension)
					case 0xfe:  // Comment Extension.
						while (true) {  // Seek through subblocks.
							const block_size = buffer[p++];
							// Bad block size (ex: undefined from an out of bounds read).
							if (!(block_size >= 0)) throw Error("Invalid block size");
							if (block_size === 0) break;  // 0 size is terminator
							p += block_size;
						}
						break;

					default:
						throw new Error(
							"Unknown graphic control label: 0x" + buffer[p - 1].toString(16));
				}
				break;

			case 0x2c:  // Image Descriptor.
				const x = buffer[p++] | buffer[p++] << 8;
				const y = buffer[p++] | buffer[p++] << 8;
				const width = buffer[p++] | buffer[p++] << 8;
				const height = buffer[p++] | buffer[p++] << 8;
				const pf2 = buffer[p++];
				const local_palette_flag = pf2 >> 7;
				const interlace_flag = pf2 >> 6 & 1;
				const num_local_colors_pow2 = pf2 & 0x7;
				const num_local_colors = 1 << (num_local_colors_pow2 + 1);
				let palette_offset = global_palette_offset;
				let palette_size = global_palette_size;
				let has_local_palette = false;
				if (local_palette_flag) {
					has_local_palette = true;
					palette_offset = p;  // Override with local palette.
					palette_size = num_local_colors;
					p += (num_local_colors << 1) + num_local_colors;  // Seek past palette.
				}

				let data_offset = p;

				p++;  // codesize
				while (true) {
					const block_size = buffer[p++];
					// Bad block size (ex: undefined from an out of bounds read).
					if (!(block_size >= 0)) throw Error("Invalid block size");
					if (block_size === 0) break;  // 0 size is terminator
					p += block_size;
				}

				frames.push({
					x,
					y,
					width,
					height,
					has_local_palette,
					palette_offset,
					palette_size,
					data_offset,
					data_length: p - data_offset,
					transparent_index,
					interlaced: Boolean(interlace_flag),
					delay,
					disposal,
				});
				break;

			case 0x3b:  // Trailer Marker (end of file).
				no_eof = false;
				break;

			default:
				throw new Error("Unknown gif block: 0x" + buffer[p - 1].toString(16));
				break;
		}
	}

	const bitmapArr = [];
	const promises = [];
	for (let i = 0; i < frames.length; i++) {
		const imageData = new ImageData(width, height);
		decodeAndBlitFrameRGBA(buffer, frames[i], imageData.data);
		promises.push(
			createImageBitmap(imageData).then((value) => {
				bitmapArr[i] = value;
			}),
		);
	}

	await Promise.all(promises).then(() => {
		for (let i = 0; i < bitmapArr.length; i++) {
			const tex = new ImageBitmapTexture(bitmapArr[i], width, height);
			result.push(tex);
		}
	});

	return result;
}

function decodeAndBlitFrameRGBA(buffer: Uint8Array, frame: GifFrame, pixels: Uint8ClampedArray) {
	const num_pixels = frame.width * frame.height;
	const index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
	gifReaderLZWOutputIndexStream(
		buffer, frame.data_offset, index_stream, num_pixels);
	const palette_offset = frame.palette_offset;

	// NOTE(deanm): It seems to be much faster to compare index to 256 than
	// to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
	// the profile, not sure if it's related to using a Uint8Array.
	var trans = frame.transparent_index;
	if (trans === null) trans = 256;

	// We are possibly just blitting to a portion of the entire frame.
	// That is a subrect within the framerect, so the additional pixels
	// must be skipped over after we finished a scanline.
	var framewidth = frame.width;
	var framestride = frame.width - framewidth;
	var xleft = framewidth;  // Number of subrect pixels left in scanline.

	// Output index of the top left corner of the subrect.
	var opbeg = ((frame.y * frame.width) + frame.x) << 2;
	// Output index of what would be the left edge of the subrect, one row
	// below it, i.e. the index at which an interlace pass should wrap.
	var opend = ((frame.y + frame.height) * frame.width + frame.x) << 2;
	var op = opbeg;

	let scanstride = framestride << 2;

	// Use scanstride to skip past the rows when interlacing.  This is skipping
	// 7 rows for the first two passes, then 3 then 1.
	if (frame.interlaced === true) {
		scanstride += frame.width * 28;  // Pass 1.
	}

	let interlaceskip = 8;  // Tracking the row interval in the current pass.

	for (let i = 0, il = index_stream.length; i < il; ++i) {
		const index = index_stream[i];

		if (xleft === 0) {  // Beginning of new scan line
			op += scanstride;
			xleft = framewidth;
			if (op >= opend) { // Catch the wrap to switch passes when interlacing.
				scanstride = (framestride << 2) + (frame.width << 2) * (interlaceskip - 1);
				// interlaceskip / 2 * 4 is interlaceskip << 1.
				op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
				interlaceskip >>= 1;
			}
		}

		if (index === trans) {
			op += 4;
		} else {
			const index3 = (index << 1) + index;
			const r = buffer[palette_offset + index3];
			const g = buffer[palette_offset + index3 + 1];
			const b = buffer[palette_offset + index3 + 2];
			pixels[op++] = r;
			pixels[op++] = g;
			pixels[op++] = b;
			pixels[op++] = 255;
		}
		--xleft;
	}
};

function gifReaderLZWOutputIndexStream(buffer: Uint8Array, p: number, output: Uint8Array, output_length: number) {
	let min_code_size = buffer[p++];
	let clear_code = 1 << min_code_size;
	let eoi_code = clear_code + 1;
	let next_code = eoi_code + 1;

	let cur_code_size = min_code_size + 1;  // Number of bits per code.
	// NOTE: This shares the same name as the encoder, but has a different
	// meaning here.  Here this masks each code coming from the code stream.
	let code_mask = (1 << cur_code_size) - 1;
	let cur_shift = 0;
	let cur = 0;
	let op = 0;  // Output pointer.
	let subblock_size = buffer[p++];
	const code_table = new Int32Array(4096);  // Can be signed, we only use 20 bits.

	var prev_code = null;  // Track code-1.

	while (true) {
		// Read up to two bytes, making sure we always 12-bits for max sized code.
		while (cur_shift < 16) {
			if (subblock_size === 0) break;  // No more data to be read.

			cur |= buffer[p++] << cur_shift;
			cur_shift += 8;

			if (subblock_size === 1) {  // Never let it get to 0 to hold logic above.
				subblock_size = buffer[p++];  // Next subblock.
			} else {
				--subblock_size;
			}
		}

		// TODO(deanm): We should never really get here, we should have received
		// and EOI.
		if (cur_shift < cur_code_size)
			break;

		let code = cur & code_mask;
		cur >>= cur_code_size;
		cur_shift -= cur_code_size;

		// TODO(deanm): Maybe should check that the first code was a clear code,
		// at least this is what you're supposed to do.  But actually our encoder
		// now doesn't emit a clear code first anyway.
		if (code === clear_code) {
			// We don't actually have to clear the table.  This could be a good idea
			// for greater error checking, but we don't really do any anyway.  We
			// will just track it with next_code and overwrite old entries.

			next_code = eoi_code + 1;
			cur_code_size = min_code_size + 1;
			code_mask = (1 << cur_code_size) - 1;

			// Don't update prev_code ?
			prev_code = null;
			continue;
		} else if (code === eoi_code) {
			break;
		}

		// We have a similar situation as the decoder, where we want to store
		// variable length entries (code table entries), but we want to do in a
		// faster manner than an array of arrays.  The code below stores sort of a
		// linked list within the code table, and then "chases" through it to
		// construct the dictionary entries.  When a new entry is created, just the
		// last byte is stored, and the rest (prefix) of the entry is only
		// referenced by its table entry.  Then the code chases through the
		// prefixes until it reaches a single byte code.  We have to chase twice,
		// first to compute the length, and then to actually copy the data to the
		// output (backwards, since we know the length).  The alternative would be
		// storing something in an intermediate stack, but that doesn't make any
		// more sense.  I implemented an approach where it also stored the length
		// in the code table, although it's a bit tricky because you run out of
		// bits (12 + 12 + 8), but I didn't measure much improvements (the table
		// entries are generally not the long).  Even when I created benchmarks for
		// very long table entries the complexity did not seem worth it.
		// The code table stores the prefix entry in 12 bits and then the suffix
		// byte in 8 bits, so each entry is 20 bits.

		let chase_code = code < next_code ? code : prev_code;

		// Chase what we will output, either {CODE} or {CODE-1}.
		let chase_length = 0;
		let chase = chase_code;
		while (chase > clear_code) {
			chase = code_table[chase] >> 8;
			++chase_length;
		}

		let k = chase;

		let op_end = op + chase_length + (chase_code !== code ? 1 : 0);
		if (op_end > output_length) {
			console.log("Warning, gif stream longer than expected.");
			return;
		}

		// Already have the first byte from the chase, might as well write it fast.
		output[op++] = k;

		op += chase_length;
		let b = op;  // Track pointer, writing backwards.

		if (chase_code !== code)  // The case of emitting {CODE-1} + k.
			output[op++] = k;

		chase = chase_code;
		while (chase_length--) {
			chase = code_table[chase];
			output[--b] = chase & 0xff;  // Write backwards.
			chase >>= 8;  // Pull down to the prefix code.
		}

		if (prev_code !== null && next_code < 4096) {
			code_table[next_code++] = prev_code << 8 | k;
			// TODO(deanm): Figure out this clearing vs code growth logic better.  I
			// have an feeling that it should just happen somewhere else, for now it
			// is awkward between when we grow past the max and then hit a clear code.
			// For now just check if we hit the max 12-bits (then a clear code should
			// follow, also of course encoded in 12-bits).
			if (next_code >= code_mask + 1 && cur_code_size < 12) {
				++cur_code_size;
				code_mask = code_mask << 1 | 1;
			}
		}

		prev_code = code;
	}

	if (op !== output_length) {
		console.log("Warning, gif stream shorter than expected.");
	}

	return output;
}
