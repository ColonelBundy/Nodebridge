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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./util/OverrideStdOutputs");
const http = __importStar(require("http"));
const stoppable_1 = __importDefault(require("stoppable"));
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
const args = require('minimist')(process.argv.slice(2));
class Server {
    constructor(parentPid, workingdir, port = 0, instances = 0) {
        this.Workers = [];
        this.Instances = 0;
        this.willClose = false;
        if (!parentPid) {
            throw new Error('Parentpid is null');
        }
        if (!workingdir) {
            throw new Error('no working dir');
        }
        this.Port = port;
        this.Pid = parentPid;
        this.Workingdir = workingdir;
        this.Instances = instances > 0 ? instances : require('os').cpus().length;
        this.Server = stoppable_1.default(http.createServer(this.handler.bind(this)));
    }
    listen() {
        this.Server.listen(this.Port, 'localhost', () => {
            this.AddressInfo = this.Server.address();
            const dataToParent = JSON.stringify({
                port: this.AddressInfo.port,
                addr: this.AddressInfo.address
            });
            console.log(`[${this.Pid}] ${dataToParent}`);
            this.SetupWorkers();
            setInterval(() => this.TryKillParent(), 1000);
        });
    }
    handler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.method === 'POST') {
                    const body = yield this.Readbody(req);
                    const worker = this.Workers[Math.floor(Math.random() * this.Workers.length)];
                    worker.postMessage({
                        opt: body.opt || 'execute',
                        module: body.module,
                        data: body.data
                    });
                    worker.once('message', message => {
                        if (typeof message !== 'string') {
                            try {
                                const data = JSON.stringify(message);
                                res.setHeader('Content-Type', 'application/json');
                                res.end(data);
                            }
                            catch (ex) {
                                return this.SendError(res, ex);
                            }
                        }
                        else {
                            res.setHeader('Content-Type', 'text/plain');
                            res.end(message);
                        }
                    });
                }
                else {
                    res.end();
                }
            }
            catch (ex) {
                return this.SendError(res, ex);
            }
        });
    }
    SendError(res, err) {
        res.statusCode = 500;
        res.end(JSON.stringify({
            error: err.stack || null,
            message: err.message || err
        }));
    }
    Readbody(req) {
        return new Promise((resolve, reject) => {
            let output = '';
            req.on('data', chunk => {
                output += chunk;
            });
            req.on('end', () => {
                resolve(JSON.parse(output));
            });
        });
    }
    TryKillParent() {
        try {
            process.kill(this.Pid, 0);
        }
        catch (ex) {
            if (ex.code == 'EPERM') {
                throw new Error('No permission to check parentPid');
            }
            this.Exit();
        }
    }
    Exit() {
        this.willClose = true;
        this.Server.close((err) => __awaiter(this, void 0, void 0, function* () {
            for (const worker of this.Workers) {
                yield worker.terminate();
            }
            if (err) {
                console.log(err);
                return process.exit(1);
            }
            process.exit(0);
        }));
    }
    SetupWorkers() {
        for (let i = 0; i < this.Instances; i++) {
            this.CreateWorker();
        }
    }
    CreateWorker() {
        const worker = new worker_threads_1.Worker(path.join(__dirname, 'worker.js'), {
            workerData: { workingdir: this.Workingdir }
        });
        this.Workers.push(worker);
        worker.on('error', err => {
            throw err;
        });
        worker.on('exit', () => {
            worker.removeAllListeners();
            this.Workers.splice(this.Workers.indexOf(worker), 1);
            if (!this.willClose) {
                this.CreateWorker();
            }
        });
    }
}
new Server(args['pid'], args['workingdir'], args['port'], args['instances']).listen();
