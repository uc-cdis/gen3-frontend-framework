import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "./src/buildColors/buildColors.ts",
    output: [
      {
        file: "dist/buildColors.esm.js",
        format: "esm",
        name: "buildColors",
      },
    ],
    external: ["tinycolor2", "node:util", "node:fs", "node:path"],
    plugins: [typescript()],
  },
  {
    input: "./src/bundleIcons/bundleIcons.js",
    output: [
      {
        file: "dist/bundleIcons.esm.js",
        format: "esm",
        name: "bundleIcons",
      },
    ],
    external: [
      "@iconify/tools/lib/import/directory",
      "@iconify/tools/lib/svg/cleanup",
      "@iconify/tools/lib/colors/parse",
      "@iconify/tools/lib/optimise/svgo",
      "fs",
    ],
  },
];
