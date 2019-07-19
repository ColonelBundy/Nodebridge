"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseArgs(args) {
    const result = {};
    let currentKey = null;
    args.forEach(arg => {
        if (arg.indexOf('--') === 0) {
            const argName = arg.substring(2);
            result[argName] = undefined;
            currentKey = argName;
        }
        else if (currentKey) {
            result[currentKey] = arg;
            currentKey = null;
        }
    });
    return result;
}
exports.parseArgs = parseArgs;
