"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findInternalNewlinesRegex = /\n(?!$)/g;
const encodedNewline = '__ns_newline__';
encodeNewlinesWrittenToStream(process.stdout);
encodeNewlinesWrittenToStream(process.stderr);
function encodeNewlinesWrittenToStream(outputStream) {
    const origWriteFunction = outputStream.write;
    outputStream.write = function (value) {
        if (typeof value === 'string') {
            const argsClone = Array.prototype.slice.call(arguments, 0);
            argsClone[0] = encodeNewlinesInString(value);
            origWriteFunction.apply(this, argsClone);
        }
        else {
            origWriteFunction.apply(this, arguments);
        }
    };
}
exports.encodeNewlinesWrittenToStream = encodeNewlinesWrittenToStream;
function encodeNewlinesInString(str) {
    return str.replace(findInternalNewlinesRegex, encodedNewline);
}
