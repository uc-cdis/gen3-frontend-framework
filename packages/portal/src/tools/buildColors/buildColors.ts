import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import {
  create10ColorPallet,
  create10ColorAccessibleContrast,
} from "../../utils/colors";

const main = () => {
  const {
    values: { primary, secondary, accent, out },
  } = parseArgs({
    options: {
      primary: {
        type: "string",
        short: "p",
        default: "#532565",
      },
      secondary: {
        type: "string",
        short: "s",
        default: "#982568",
      },
      accent: {
        type: "string",
        short: "a",
        default: "#E07C3E",
      },
      out: {
        type: "string",
        short: "o",
        default: "../",
      },
    },
  });

  const primaryPallet = create10ColorPallet(primary ?? "#532565");
  const secondaryPallet = create10ColorPallet(secondary ?? "#982568");
  const accentPallet = create10ColorPallet(accent ?? "#E07C3E");
  const theme = {
    primary: primaryPallet,
    "primary-contrast": create10ColorAccessibleContrast(primaryPallet),
    secondary: secondaryPallet,
    "secondary-contrast": create10ColorAccessibleContrast(secondaryPallet),
    accent: secondaryPallet,
    "accent-contrast": create10ColorAccessibleContrast(accentPallet),
  };

  writeFileSync(join(out ?? "./", "theme.json"), JSON.stringify(theme, null, 2));
};

main();
