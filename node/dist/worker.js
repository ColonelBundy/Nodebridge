"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
const dynamicRequire = eval('require');
worker_threads_1.parentPort.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
    try {
        const module = dynamicRequire(path.resolve(worker_threads_1.workerData['workingdir'], message.module));
        const opt = module[message.opt];
        if (!opt) {
            throw new Error(`Module: ${message.module} has no exported member: ${message.opt}`);
        }
        const response = yield Promise.resolve(opt.apply(null, [...message.data]));
        worker_threads_1.parentPort.postMessage(response);
    }
    catch (ex) {
        throw ex;
    }
}));
