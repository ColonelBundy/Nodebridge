import './util/OverrideStdOutputs';
import * as http from 'http';
import { AddressInfo } from 'net';
import stoppable from './util/Stoppable';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { parseArgs } from './util/ArgsUtil';
const args: [] = parseArgs(process.argv.slice(2));

export interface BodyData {
  opt: string;
  module: string;
  data: any;
}

class Server {
  private Server: http.Server;
  private Port: number;
  private AddressInfo: AddressInfo;
  private Pid: number;
  private Workers: Worker[] = [];
  private Instances = 0;
  private Workingdir: string;
  private WorkerPath: string;
  private willClose: boolean = false;

  constructor(
    parentPid: number,
    workingdir: string,
    port = 0,
    instances = 0,
    workerPath = null
  ) {
    if (!parentPid) {
      throw new Error('Parentpid is null');
    }

    if (!workingdir) {
      throw new Error('no working dir');
    }

    if (!workerPath) {
      throw new Error('no worker');
    }

    this.Port = port;
    this.Pid = parentPid;
    this.Workingdir = workingdir;
    this.WorkerPath = workerPath;
    this.Instances = instances > 0 ? instances : require('os').cpus().length;
    this.Server = stoppable(http.createServer(this.handler.bind(this)));
  }

  public listen() {
    this.Server.listen(this.Port, 'localhost', () => {
      this.AddressInfo = this.Server.address() as AddressInfo;

      const dataToParent = JSON.stringify({
        port: this.AddressInfo.port,
        addr: this.AddressInfo.address
      });

      console.log(`[${this.Pid}] ${dataToParent}`);

      this.SetupWorkers();

      // Watch parent pid
      setInterval(() => this.TryKillParent(), 1000);
    });
  }

  private async handler(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      // Only post requests
      if (req.method === 'POST') {
        // Read body
        const body: BodyData = await this.Readbody(req);

        // Grab random worker
        const worker = this.Workers[
          Math.floor(Math.random() * this.Workers.length)
        ];

        // Post job
        worker.postMessage({
          opt: body.opt || 'execute',
          module: body.module,
          data: body.data
        });

        // Response
        worker.once('message', message => {
          // JSON
          if (typeof message !== 'string') {
            try {
              const data = JSON.stringify(message);

              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } catch (ex) {
              return this.SendError(res, ex);
            }
          } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end(message);
          }
        });
      } else {
        res.end();
      }
    } catch (ex) {
      return this.SendError(res, ex);
    }
  }

  private SendError(res: http.ServerResponse, err: any) {
    res.statusCode = 500;

    res.end(
      JSON.stringify({
        error: err.stack || null,
        message: err.message || err
      })
    );
  }

  private Readbody(req: http.IncomingMessage): Promise<BodyData> {
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

  private TryKillParent() {
    try {
      process.kill(this.Pid, 0);
    } catch (ex) {
      if (ex.code == 'EPERM') {
        throw new Error('No permission to check parentPid');
      }

      this.Exit();
    }
  }

  private Exit() {
    this.willClose = true;

    this.Server.close(async err => {
      for (const worker of this.Workers) {
        await worker.terminate();
      }

      if (err) {
        console.log(err);
        return process.exit(1);
      }

      process.exit(0);
    });
  }

  private SetupWorkers() {
    for (let i = 0; i < this.Instances; i++) {
      this.CreateWorker();
    }
  }

  private CreateWorker() {
    const worker = new Worker(this.WorkerPath, {
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

new Server(
  args['pid'],
  args['workingdir'],
  args['port'],
  args['instances'],
  args['workerpath']
).listen();
