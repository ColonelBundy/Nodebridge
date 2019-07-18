// https://github.com/aspnet/aspnetcore/blob/master/src/Middleware/NodeServices/src/TypeScript/Util/OverrideStdOutputs.ts

const findInternalNewlinesRegex = /\n(?!$)/g;
const encodedNewline = '__ns_newline__';

encodeNewlinesWrittenToStream(process.stdout);
encodeNewlinesWrittenToStream(process.stderr);

export function encodeNewlinesWrittenToStream(
  outputStream: NodeJS.WritableStream
) {
  const origWriteFunction = outputStream.write;
  outputStream.write = <any>function(value: any) {
    // Only interfere with the write if it's definitely a string
    if (typeof value === 'string') {
      const argsClone = Array.prototype.slice.call(arguments, 0);
      argsClone[0] = encodeNewlinesInString(value);
      origWriteFunction.apply(this, argsClone);
    } else {
      origWriteFunction.apply(this, arguments);
    }
  };
}

function encodeNewlinesInString(str: string): string {
  return str.replace(findInternalNewlinesRegex, encodedNewline);
}
