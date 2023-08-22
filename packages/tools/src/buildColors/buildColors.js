"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_util_1 = require("node:util");
var colors_1 = require("./colors");
var main = function () {
    var _a = (0, node_util_1.parseArgs)({
        options: {
            themeFile: {
                type: 'string',
                short: 't',
                default: './colors.json',
            },
            primary: {
                type: 'string',
                short: 'p',
                default: '#532565',
            },
            secondary: {
                type: 'string',
                short: 's',
                default: '#982568',
            },
            accent: {
                type: 'string',
                short: 'a',
                default: '#E07C3E',
            },
            base: {
                type: 'string',
                short: 'b',
                default: '#E07C3E',
            },
            out: {
                type: 'string',
                short: 'o',
                default: '../',
            },
        },
    }).values, themeFile = _a.themeFile, out = _a.out;
    if (themeFile) {
        var themeData = (0, node_fs_1.readFileSync)(themeFile, { encoding: 'utf8', flag: 'r' });
        var themeColors = JSON.parse(themeData);
        var primaryPallet = (0, colors_1.create10ColorPallet)(themeColors.primary);
        var secondaryPallet = (0, colors_1.create10ColorPallet)(themeColors.secondary);
        var accentPallet = (0, colors_1.create10ColorPallet)(themeColors.accent);
        var basePallet = (0, colors_1.create10ColorPallet)(themeColors.base);
        var theme = {
            primary: primaryPallet,
            'primary-contrast': (0, colors_1.create10ColorAccessibleContrast)(primaryPallet),
            secondary: secondaryPallet,
            'secondary-contrast': (0, colors_1.create10ColorAccessibleContrast)(secondaryPallet),
            accent: secondaryPallet,
            'accent-contrast': (0, colors_1.create10ColorAccessibleContrast)(accentPallet),
            base: secondaryPallet,
            'base-contrast': (0, colors_1.create10ColorAccessibleContrast)(basePallet),
        };
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(out !== null && out !== void 0 ? out : './', 'theme.json'), JSON.stringify(theme, null, 2));
    }
};
main();
