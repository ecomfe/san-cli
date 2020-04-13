/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 修改自 https://github.com/yargs/yargs/blob/master/lib/argsert.js
 * 检验入参类型
 */
module.exports = argsert;
const SError = require('./SError');
const {error} = require('./ttyLogger');

const positionName = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
function argsert(expected, callerArguments, length) {
    try {
        let position = 0;
        let parsed = {demanded: [], optional: []};
        if (typeof expected === 'object') {
            length = callerArguments;
            callerArguments = expected;
        } else {
            parsed = parseCommand(expected);
        }
        const args = [].slice.call(callerArguments);

        while (args.length && args[args.length - 1] === undefined) {
            args.pop();
        }
        length = length || args.length;

        if (length < parsed.demanded.length) {
            throw new SError(
                `Not enough arguments provided. Expected ${parsed.demanded.length} but received ${args.length}.`
            );
        }

        const totalCommands = parsed.demanded.length + parsed.optional.length;
        if (length > totalCommands) {
            throw new SError(`Too many arguments provided. Expected max ${totalCommands} but received ${length}.`);
        }

        parsed.demanded.forEach(demanded => {
            const arg = args.shift();
            const observedType = guessType(arg);
            const matchingTypes = demanded.cmd.filter(type => type === observedType || type === '*');
            if (matchingTypes.length === 0) {
                argumentTypeError(observedType, demanded.cmd, position, false);
            }
            position += 1;
        });

        parsed.optional.forEach(optional => {
            if (args.length === 0) {
                return;
            }
            const arg = args.shift();
            const observedType = guessType(arg);
            const matchingTypes = optional.cmd.filter(type => type === observedType || type === '*');
            if (matchingTypes.length === 0) {
                argumentTypeError(observedType, optional.cmd, position, true);
            }
            position += 1;
        });
    } catch (err) {
        error(err);
    }
}

function guessType(arg) {
    if (Array.isArray(arg)) {
        return 'array';
    } else if (arg === null) {
        return 'null';
    }
    return typeof arg;
}

function argumentTypeError(observedType, allowedTypes, position, optional) {
    throw new SError(
        `Invalid ${positionName[position] || 'manyith'} argument. Expected ${allowedTypes.join(
            ' or '
        )} but received ${observedType}.`
    );
}
function parseCommand(cmd) {
    const extraSpacesStrippedCommand = cmd.replace(/\s{2,}/g, ' ');
    const splitCommand = extraSpacesStrippedCommand.split(/\s+(?![^[]*]|[^<]*>)/);
    const bregex = /\.*[\][<>]/g;
    const parsedCommand = {
        demanded: [],
        optional: []
    };
    splitCommand.forEach((cmd, i) => {
        let variadic = false;
        cmd = cmd.replace(/\s/g, '');
        if (/\.+[\]>]/.test(cmd) && i === splitCommand.length - 1) {
            variadic = true;
        }
        if (/^\[/.test(cmd)) {
            parsedCommand.optional.push({
                cmd: cmd.replace(bregex, '').split('|'),
                variadic
            });
        } else {
            parsedCommand.demanded.push({
                cmd: cmd.replace(bregex, '').split('|'),
                variadic
            });
        }
    });
    return parsedCommand;
}
