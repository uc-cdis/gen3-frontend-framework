import { createColorPallet, createAccessibleContrast } from "../colors";

// unit test for createColorPallet
describe("createColorPallet", () => {
  it("should return an object 10 colors", () => {
    const pallet = createColorPallet("#267F98");
    expect(pallet).toEqual({
      max: "#e9f2f5",
      lightest: "#b8d5de",
      lighter: "#88b9c6",
      light: "#579caf",
      DEFAULT: "#267F98",
      vivid: "#1c84a1",
      dark: "#1d6276",
      darker: "#154654",
      darkest: "#0c2931",
      min: "#040d0f",
    });
  });

  it("create the contrast color pallet", () => {
    const pallet = createColorPallet("#267F98");
    const contrastPallet = createAccessibleContrast(pallet);
    expect(contrastPallet).toEqual({
      max: "#111111",
      lightest: "#111111",
      lighter: "#111111",
      light: "#111111",
      DEFAULT: "#fefefe",
      vivid: "#000000",
      dark: "#fefefe",
      darker: "#fefefe",
      darkest: "#fefefe",
      min: "#fefefe",
    });
  });
});
