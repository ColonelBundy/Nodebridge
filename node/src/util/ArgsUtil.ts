// https://github.com/aspnet/JavaScriptServices/blob/master/src/Microsoft.AspNetCore.NodeServices/TypeScript/Util/ArgsUtil.ts
export function parseArgs(args: string[]): any {
  const result = {};
  let currentKey = null;
  args.forEach(arg => {
    if (arg.indexOf('--') === 0) {
      const argName = arg.substring(2);
      result[argName] = undefined;
      currentKey = argName;
    } else if (currentKey) {
      result[currentKey] = arg;
      currentKey = null;
    }
  });

  return result;
}
