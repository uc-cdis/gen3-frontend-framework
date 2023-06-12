import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import json from "@rollup/plugin-json";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { swc } from "rollup-plugin-swc3";

const globals = {
  react: "React",
  "@mantine/core": "mantine",
  "@mantine/hooks": "mantineHooks",
  "@gen3/core": "gen3Core",
};

const config = [
  {
    input: "src/index.tsx",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        globals,
      },
      {
        file: "dist/index.min.js",
        format: "iife",
        name: "crosswalk",
        plugins: [terser()],
        globals,
      },
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "crosswalk",
        globals,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        name: "crosswalk",
        globals,
      },
    ],
    external: Object.keys(globals),
    plugins: [
      peerDepsExternal(),
      json(),
      swc({
        // All options are optional
        include: /\.[mc]?[jt]sx?$/, // default
        exclude: /node_modules/, // default
        tsconfig: "tsconfig.json", // default
        // tsconfig: false, // You can also prevent `rollup-plugin-swc` from reading tsconfig.json, see below
        // And add your swc configuration here!
        // "filename" will be ignored since it is handled by rollup
        jsc: {},
      }),
    ],
  }
];

export default config;
