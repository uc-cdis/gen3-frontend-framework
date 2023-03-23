import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import json from "@rollup/plugin-json";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const production = !process.env.ROLLUP_WATCH;

const globals = {
  react: "React",
  redux: "redux",
  lodash: "lodash",
  immer: "immer",
  "next/image": "next/image",
  "next/link": "next/link",
  "next/router": "next/router",
  "@mantine/core": "mantine/core",
  "@gen3/core": "gen3/core",
  "react-icons/fa": "react-icons/fa",
  "tailwind-styled-components": "tailwind-styled-components",
};

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
      {
        file: "dist/index.min.js",
        format: "iife",
        name: "gen3components",
        plugins: [terser()],
        globals,
      },
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "gen3components",
        globals,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        name: "gen3components",
      },
    ],
    external: [
      "lodash",
      "uuid",
      "tailwind-styled-components",
      "next/image",
      "next/link",
      "next/router",
      "@mantine/core",
      "@gen3/core",
      "react-icons/fa",
    ],
    plugins: [
      peerDepsExternal(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),
      json(),
      babel({
        presets: ["@babel/preset-react"],
        babelHelpers: "runtime",
      }),
    ],
  },
  {
    input: "./dist/dts/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
