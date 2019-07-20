(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nvar __importStar = (this && this.__importStar) || function (mod) {\r\n    if (mod && mod.__esModule) return mod;\r\n    var result = {};\r\n    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];\r\n    result[\"default\"] = mod;\r\n    return result;\r\n};\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n__webpack_require__(/*! ./util/OverrideStdOutputs */ \"./src/util/OverrideStdOutputs.ts\");\r\nconst http = __importStar(__webpack_require__(/*! http */ \"http\"));\r\nconst Stoppable_1 = __importDefault(__webpack_require__(/*! ./util/Stoppable */ \"./src/util/Stoppable.ts\"));\r\nconst worker_threads_1 = __webpack_require__(!(function webpackMissingModule() { var e = new Error(\"Cannot find module 'worker_threads'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));\r\nconst ArgsUtil_1 = __webpack_require__(/*! ./util/ArgsUtil */ \"./src/util/ArgsUtil.ts\");\r\nconst args = ArgsUtil_1.parseArgs(process.argv.slice(2));\r\nclass Server {\r\n    constructor(parentPid, workingdir, port = 0, instances = 0, workerPath = null) {\r\n        this.Workers = [];\r\n        this.Instances = 0;\r\n        this.willClose = false;\r\n        if (!parentPid) {\r\n            throw new Error('Parentpid is null');\r\n        }\r\n        if (!workingdir) {\r\n            throw new Error('no working dir');\r\n        }\r\n        if (!workerPath) {\r\n            throw new Error('no worker');\r\n        }\r\n        this.Port = port;\r\n        this.Pid = parentPid;\r\n        this.Workingdir = workingdir;\r\n        this.WorkerPath = workerPath;\r\n        this.Instances = instances > 0 ? instances : __webpack_require__(/*! os */ \"os\").cpus().length;\r\n        this.Server = Stoppable_1.default(http.createServer(this.handler.bind(this)));\r\n    }\r\n    listen() {\r\n        this.Server.listen(this.Port, 'localhost', () => {\r\n            this.AddressInfo = this.Server.address();\r\n            const dataToParent = JSON.stringify({\r\n                port: this.AddressInfo.port,\r\n                addr: this.AddressInfo.address\r\n            });\r\n            console.log(`[${this.Pid}] ${dataToParent}`);\r\n            this.SetupWorkers();\r\n            setInterval(() => this.TryKillParent(), 1000);\r\n        });\r\n    }\r\n    handler(req, res) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            try {\r\n                if (req.method === 'POST') {\r\n                    const body = yield this.Readbody(req);\r\n                    const worker = this.Workers[Math.floor(Math.random() * this.Workers.length)];\r\n                    worker.postMessage({\r\n                        opt: body.opt || 'execute',\r\n                        module: body.module,\r\n                        data: body.data\r\n                    });\r\n                    worker.once('message', message => {\r\n                        if (typeof message !== 'string') {\r\n                            try {\r\n                                const data = JSON.stringify(message);\r\n                                res.setHeader('Content-Type', 'application/json');\r\n                                res.end(data);\r\n                            }\r\n                            catch (ex) {\r\n                                return this.SendError(res, ex);\r\n                            }\r\n                        }\r\n                        else {\r\n                            res.setHeader('Content-Type', 'text/plain');\r\n                            res.end(message);\r\n                        }\r\n                    });\r\n                }\r\n                else {\r\n                    res.end();\r\n                }\r\n            }\r\n            catch (ex) {\r\n                return this.SendError(res, ex);\r\n            }\r\n        });\r\n    }\r\n    SendError(res, err) {\r\n        res.statusCode = 500;\r\n        res.end(JSON.stringify({\r\n            error: err.stack || null,\r\n            message: err.message || err\r\n        }));\r\n    }\r\n    Readbody(req) {\r\n        return new Promise((resolve, reject) => {\r\n            let output = '';\r\n            req.on('data', chunk => {\r\n                output += chunk;\r\n            });\r\n            req.on('end', () => {\r\n                resolve(JSON.parse(output));\r\n            });\r\n        });\r\n    }\r\n    TryKillParent() {\r\n        try {\r\n            process.kill(this.Pid, 0);\r\n        }\r\n        catch (ex) {\r\n            if (ex.code == 'EPERM') {\r\n                throw new Error('No permission to check parentPid');\r\n            }\r\n            this.Exit();\r\n        }\r\n    }\r\n    Exit() {\r\n        this.willClose = true;\r\n        this.Server.close((err) => __awaiter(this, void 0, void 0, function* () {\r\n            for (const worker of this.Workers) {\r\n                yield worker.terminate();\r\n            }\r\n            if (err) {\r\n                console.log(err);\r\n                return process.exit(1);\r\n            }\r\n            process.exit(0);\r\n        }));\r\n    }\r\n    SetupWorkers() {\r\n        for (let i = 0; i < this.Instances; i++) {\r\n            this.CreateWorker();\r\n        }\r\n    }\r\n    CreateWorker() {\r\n        const worker = new worker_threads_1.Worker(this.WorkerPath, {\r\n            workerData: { workingdir: this.Workingdir }\r\n        });\r\n        this.Workers.push(worker);\r\n        worker.on('error', err => {\r\n            throw err;\r\n        });\r\n        worker.on('exit', () => {\r\n            worker.removeAllListeners();\r\n            this.Workers.splice(this.Workers.indexOf(worker), 1);\r\n            if (!this.willClose) {\r\n                this.CreateWorker();\r\n            }\r\n        });\r\n    }\r\n}\r\nnew Server(args['pid'], args['workingdir'], args['port'], args['instances'], args['workerpath']).listen();\r\n\n\n//# sourceURL=webpack:///./src/index.ts?");

/***/ }),

/***/ "./src/util/ArgsUtil.ts":
/*!******************************!*\
  !*** ./src/util/ArgsUtil.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nfunction parseArgs(args) {\r\n    const result = {};\r\n    let currentKey = null;\r\n    args.forEach(arg => {\r\n        if (arg.indexOf('--') === 0) {\r\n            const argName = arg.substring(2).toLowerCase();\r\n            result[argName] = undefined;\r\n            currentKey = argName;\r\n        }\r\n        else if (currentKey) {\r\n            result[currentKey] = arg;\r\n            currentKey = null;\r\n        }\r\n    });\r\n    return result;\r\n}\r\nexports.parseArgs = parseArgs;\r\n\n\n//# sourceURL=webpack:///./src/util/ArgsUtil.ts?");

/***/ }),

/***/ "./src/util/OverrideStdOutputs.ts":
/*!****************************************!*\
  !*** ./src/util/OverrideStdOutputs.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst findInternalNewlinesRegex = /\\n(?!$)/g;\r\nconst encodedNewline = '__ns_newline__';\r\nencodeNewlinesWrittenToStream(process.stdout);\r\nencodeNewlinesWrittenToStream(process.stderr);\r\nfunction encodeNewlinesWrittenToStream(outputStream) {\r\n    const origWriteFunction = outputStream.write;\r\n    outputStream.write = function (value) {\r\n        if (typeof value === 'string') {\r\n            const argsClone = Array.prototype.slice.call(arguments, 0);\r\n            argsClone[0] = encodeNewlinesInString(value);\r\n            origWriteFunction.apply(this, argsClone);\r\n        }\r\n        else {\r\n            origWriteFunction.apply(this, arguments);\r\n        }\r\n    };\r\n}\r\nexports.encodeNewlinesWrittenToStream = encodeNewlinesWrittenToStream;\r\nfunction encodeNewlinesInString(str) {\r\n    return str.replace(findInternalNewlinesRegex, encodedNewline);\r\n}\r\n\n\n//# sourceURL=webpack:///./src/util/OverrideStdOutputs.ts?");

/***/ }),

/***/ "./src/util/Stoppable.ts":
/*!*******************************!*\
  !*** ./src/util/Stoppable.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __importStar = (this && this.__importStar) || function (mod) {\r\n    if (mod && mod.__esModule) return mod;\r\n    var result = {};\r\n    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];\r\n    result[\"default\"] = mod;\r\n    return result;\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst https = __importStar(__webpack_require__(/*! https */ \"https\"));\r\nexports.default = (server, grace = undefined) => {\r\n    grace = typeof grace === 'undefined' ? Infinity : grace;\r\n    const reqsPerSocket = new Map();\r\n    let stopped = false;\r\n    let gracefully = true;\r\n    if (server instanceof https.Server) {\r\n        server.on('secureConnection', onConnection);\r\n    }\r\n    else {\r\n        server.on('connection', onConnection);\r\n    }\r\n    server.on('request', onRequest);\r\n    server['stop'] = stop;\r\n    server['_pendingSockets'] = reqsPerSocket;\r\n    return server;\r\n    function onConnection(socket) {\r\n        reqsPerSocket.set(socket, 0);\r\n        socket.once('close', () => reqsPerSocket.delete(socket));\r\n    }\r\n    function onRequest(req, res) {\r\n        reqsPerSocket.set(req.socket, reqsPerSocket.get(req.socket) + 1);\r\n        res.once('finish', () => {\r\n            const pending = reqsPerSocket.get(req.socket) - 1;\r\n            reqsPerSocket.set(req.socket, pending);\r\n            if (stopped && pending === 0) {\r\n                req.socket.end();\r\n            }\r\n        });\r\n    }\r\n    function stop(callback) {\r\n        setImmediate(() => {\r\n            stopped = true;\r\n            if (grace < Infinity) {\r\n                setTimeout(destroyAll, grace).unref();\r\n            }\r\n            server.close(e => {\r\n                if (callback) {\r\n                    callback(e, gracefully);\r\n                }\r\n            });\r\n            reqsPerSocket.forEach(endIfIdle);\r\n        });\r\n    }\r\n    function endIfIdle(requests, socket) {\r\n        if (requests === 0)\r\n            socket.end();\r\n    }\r\n    function destroyAll() {\r\n        gracefully = false;\r\n        reqsPerSocket.forEach((reqs, socket) => socket.end());\r\n        setImmediate(() => {\r\n            reqsPerSocket.forEach((reqs, socket) => socket.destroy());\r\n        });\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack:///./src/util/Stoppable.ts?");

/***/ }),

/***/ 0:
/*!*************************!*\
  !*** multi ./src/index ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/index */\"./src/index.ts\");\n\n\n//# sourceURL=webpack:///multi_./src/index?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"https\");\n\n//# sourceURL=webpack:///external_%22https%22?");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"os\");\n\n//# sourceURL=webpack:///external_%22os%22?");

/***/ })

/******/ })));