namespace StringHelper {
    export function formatString(formatText: string, ...args: string[]): string {
        for (const [i, arg] of args.entries()) {
            const regExp = new RegExp(`\\{${i}\\}`, 'g')
            formatText = formatText.replace(regExp, arg);
        }
        return formatText;
    }

    export function formatDate(date: Date, format: string): string {
        return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
    }

    export function resolveString(str: string, context): string {
        const placeholderPattern = /{{(.*?)}}/g;
        return str.replace(placeholderPattern, (match, p1) => {
            const resolvedValue = resolveValue(context, p1.trim());
            return resolvedValue !== undefined && resolvedValue !== null ? resolvedValue : match;
        });
    }

    function resolvePath(obj, path: string) {
        return path.split('.').reduce((acc, key) => {
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
                return acc[arrayKey][index];
            }
            return acc[key];
        }, obj);
    }

    function resolveArguments(argsStr: string, context) {
        return argsStr.split(',').map(arg => {
            arg = arg.trim();
            if (arg.startsWith('`') && arg.endsWith('`')) {
                const argStr = arg.substring(1, arg.length - 1);
                return argStr.replace(/\$\{(.*?)\}/g, (match, p1) => {
                    return resolveValue(context, p1.trim());
                });
            }
            if (arg.startsWith('"') && arg.endsWith('"')) {
                return arg.substring(1, arg.length - 1);
            }
            if (!isNaN(arg as any)) {
                return Number(arg);
            }
            if (arg === 'true') {
                return true;
            }
            if (arg === 'false') {
                return false;
            }
            if (arg === 'null') {
                return null;
            }
            if (arg === 'undefined') {
                return undefined;
            }
            return resolveValue(context, arg);
        });
    };

    function resolveValue(obj, path: string) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        const segments = [];
        let buffer = '';
        let inFunction = false;
        let inBrackets = false;
        for (let i = 0; i < path.length; i++) {
            const char = path[i];
            if (char === '(') {
                inFunction = true;
            } else if (char === ')') {
                inFunction = false;
            } else if (char === '[') {
                inBrackets = true;
            } else if (char === ']') {
                inBrackets = false;
            } else if (char === '.' && !inFunction && !inBrackets) {
                segments.push(buffer);
                buffer = '';
                continue;
            }
            buffer += char;
        }
        segments.push(buffer);

        let current = obj;
        for (let i = 0; i < segments.length; i++) {
            let key = segments[i];
            if (current === null || current === undefined) {
                return current;
            }
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
                current = current[arrayKey][index];
            } else if (key.includes('(') && key.includes(')')) {
                const funcPath = key.substring(0, key.indexOf('('));
                const argsStr = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                const args = resolveArguments(argsStr, obj);
                const func = resolvePath(current, funcPath);
                if (!func) {
                    return null;
                }
                current = func(...args);
            } else {
                current = current[key];
            }
        }
        return current;
    };
}
