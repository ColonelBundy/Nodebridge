import { workerData, parentPort, MessageChannel } from 'worker_threads';
import * as path from 'path';
import { BodyData } from './index';

const dynamicRequire: (name: string) => any = eval('require');

parentPort.on('message', async (message: BodyData) => {
  try {
    const module = dynamicRequire(
      path.resolve(workerData['workingdir'], message.module)
    );
    const opt: Function = module[message.opt];

    if (!opt) {
      throw new Error(
        `Module: ${message.module} has no exported member: ${message.opt}`
      );
    }

    const response = await Promise.resolve(opt.apply(null, [...message.data]));

    parentPort.postMessage(response);
  } catch (ex) {
    throw ex;
  }
});
