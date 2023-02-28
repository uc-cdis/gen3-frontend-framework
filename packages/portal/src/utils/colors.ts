import tinycolor, { Instance } from "tinycolor2";

const DEFAULT_NUM_DARK_COLORS = 4;
const DEFAULT_NUM_LIGHT_COLORS = 4;

export const errorColor = tinycolor("#ffffffff");

const CONTRAST_RANGE = ["#111111", "#FEFEFE"];

const mix = (startColor: Instance, mixinColor: Instance, weight: number) => {
  if (!mixinColor || !mixinColor.isValid()) {
    throw new Error(
      'Argument to "mix" was not a Color instance, but rather an instance of ' +
        typeof mixinColor,
    );
  }

  const color1 = mixinColor;
  const p = weight === undefined ? 0.5 : weight;

  const w = 2 * p - 1;
  const a = color1.getAlpha() - startColor.getAlpha();

  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
  const w2 = 1 - w1;

  return tinycolor.fromRatio({
    r: w1 * color1.toRgb().r + w2 * startColor.toRgb().r,
    g: w1 * color1.toRgb().g + w2 * startColor.toRgb().g,
    b: w1 * color1.toRgb().b + w2 * startColor.toRgb().b,
    a: color1.getAlpha() * p + startColor.getAlpha() * (1 - p),
  });
};

export const getColorsList = (
  colorsAmount: number,
  colorsShiftAmount: number,
  mixColor: Instance,
  rotate: number,
  saturation: number,
  mainColor: Instance,
) => {
  const colorsList = [];
  const givenColor = mainColor.isValid() ? mainColor : errorColor;

  let step;
  for (step = 0; step < colorsAmount; step++) {
    if (mainColor.isValid()) {
      colorsList.push(
        mix(
          tinycolor(givenColor).saturate(
            ((step + 1) / colorsAmount) * (saturation / 100),
          ),

          tinycolor(mixColor),
          ((colorsShiftAmount / 100) * (step + 1)) / colorsAmount,
        ),
      );
    } else {
      colorsList.push(errorColor);
    }
  }
  return colorsList;
};

const colorType = [
  "min",
  "darkest",
  "darker",
  "dark",
  "DEFAULT",
  "vivid",
  "light",
  "lighter",
  "lightest",
  "max",
];

export const createColorPallet = (
  mainColor: string,
): Record<string, string> => {
  const darkColors = getColorsList(
    DEFAULT_NUM_DARK_COLORS,
    90,
    tinycolor("#000000"),
    0.0,
    20,
    tinycolor(mainColor),
  )
    .reverse()
    .map((color) => color);
  const lightColors = getColorsList(
    DEFAULT_NUM_LIGHT_COLORS,
    90,
    tinycolor("#ffffff"),
    0.0,
    20,
    tinycolor(mainColor),
  ).map((color) => color);

  return {
    DEFAULT: mainColor,
    vivid: tinycolor(mainColor).saturate(10).toHexString(),
    ...darkColors.reduce((obj, c: Instance, idx) => {
      obj[colorType[idx]] = c.toHexString();
      return obj;
    }, {} as Record<string, string>),
    ...lightColors.reduce((obj, c: Instance, idx) => {
      obj[colorType[idx+6]] = c.toHexString();
      return obj;
    }, {} as Record<string, string>),
  };
};

export const createAccessibleContrast = (
  pallet: Record<string, string>,
): Record<string, string> => {
  return Object.entries(pallet).reduce((results, [colorName, value]) => {
    return {
      ...results,
      [colorName]: tinycolor
        .mostReadable(value, CONTRAST_RANGE, {
          includeFallbackColors: true,
          level: "AAA",
          size: "large",
        })
        .toHexString(),
    };
  }, {});
};
