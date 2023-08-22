"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create10ColorAccessibleContrast = exports.create10ColorPallet = exports.getColorsList = exports.errorColor = void 0;
var tinycolor2_1 = require("tinycolor2");
var DEFAULT_NUM_DARK_COLORS = 4;
var DEFAULT_NUM_LIGHT_COLORS = 4;
exports.errorColor = (0, tinycolor2_1.default)('#ffffffff');
var CONTRAST_RANGE = ['#111111', '#FEFEFE'];
var mix = function (startColor, mixinColor, weight) {
    if (!mixinColor || !mixinColor.isValid()) {
        throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' +
            typeof mixinColor);
    }
    var color1 = mixinColor;
    var p = weight === undefined ? 0.5 : weight;
    var w = 2 * p - 1;
    var a = color1.getAlpha() - startColor.getAlpha();
    var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
    var w2 = 1 - w1;
    return tinycolor2_1.default.fromRatio({
        r: w1 * color1.toRgb().r + w2 * startColor.toRgb().r,
        g: w1 * color1.toRgb().g + w2 * startColor.toRgb().g,
        b: w1 * color1.toRgb().b + w2 * startColor.toRgb().b,
        a: color1.getAlpha() * p + startColor.getAlpha() * (1 - p),
    });
};
var getColorsList = function (colorsAmount, colorsShiftAmount, mixColor, saturation, mainColor) {
    var colorsList = [];
    var givenColor = mainColor.isValid() ? mainColor : exports.errorColor;
    var step;
    for (step = 0; step < colorsAmount; step++) {
        if (mainColor.isValid()) {
            colorsList.push(mix(givenColor.saturate(((step + 1) / colorsAmount) * (saturation / 100)), mixColor, ((colorsShiftAmount / 100) * (step + 1)) / colorsAmount));
        }
        else {
            colorsList.push(exports.errorColor);
        }
    }
    return colorsList;
};
exports.getColorsList = getColorsList;
var colorType = [
    'min',
    'darkest',
    'darker',
    'dark',
    'DEFAULT',
    'vivid',
    'light',
    'lighter',
    'lightest',
    'max',
];
var create10ColorPallet = function (mainColor) {
    var darkColors = (0, exports.getColorsList)(DEFAULT_NUM_DARK_COLORS, 90, (0, tinycolor2_1.default)('#000000'), 20, (0, tinycolor2_1.default)(mainColor))
        .reverse()
        .map(function (color) { return color; });
    var lightColors = (0, exports.getColorsList)(DEFAULT_NUM_LIGHT_COLORS, 90, (0, tinycolor2_1.default)('#ffffff'), 20, (0, tinycolor2_1.default)(mainColor)).map(function (color) { return color; });
    return __assign(__assign({ DEFAULT: mainColor, vivid: (0, tinycolor2_1.default)(mainColor).saturate(10).toHexString() }, darkColors.reduce(function (obj, c, idx) {
        obj[colorType[idx]] = c.toHexString();
        return obj;
    }, {})), lightColors.reduce(function (obj, c, idx) {
        obj[colorType[idx + 6]] = c.toHexString();
        return obj;
    }, {}));
};
exports.create10ColorPallet = create10ColorPallet;
var create10ColorAccessibleContrast = function (pallet) {
    return Object.entries(pallet).reduce(function (results, _a) {
        var _b;
        var colorName = _a[0], value = _a[1];
        return __assign(__assign({}, results), (_b = {}, _b[colorName] = tinycolor2_1.default
            .mostReadable(value, CONTRAST_RANGE, {
            includeFallbackColors: true,
            level: 'AAA',
            size: 'large',
        })
            .toHexString(), _b));
    }, {});
};
exports.create10ColorAccessibleContrast = create10ColorAccessibleContrast;
