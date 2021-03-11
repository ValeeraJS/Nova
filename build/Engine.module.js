/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class WebGPUEngine {
    constructor() {
        this.adapter = null;
        this.context = null;
        this.device = null;
    }
    static detect(canvas = document.createElement("canvas"), engine) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const adapter = yield ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
            if (!adapter) {
                return false;
            }
            const device = yield adapter.requestDevice();
            if (!device) {
                return false;
            }
            const context = canvas.getContext("gpupresent");
            if (!context) {
                return false;
            }
            if (engine) {
                engine.init(adapter, device, context);
            }
            return true;
        });
    }
    // constructor() {}
    init(adapter, device, contex) {
        this.adapter = adapter;
        this.device = device;
        this.context = contex;
        return this;
    }
}

export { WebGPUEngine };
//# sourceMappingURL=Engine.module.js.map
