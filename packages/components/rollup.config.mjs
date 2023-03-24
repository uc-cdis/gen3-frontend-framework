import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import styles from "rollup-plugin-styles";

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
  "@iconify/react": "iconify/react",
  "react-icons/fa": "react-icons/fa",
  "react-icons/md": "react-icons/md",
  "mantine-react-table ": "mantine-react-table",
  "tailwind-styled-components": "tw",
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
      "react",
      "lodash",
      "tailwind-styled-components",
      "next/image",
      "next/link",
      "next/router",
      "@mantine/core",
      "@gen3/core",
      "react-icons/fa",
      "react-icons/md",
      "@iconify/react",
      "mantine-react-table",
    ],
    plugins: [
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),
      json(),
      postcss({
        config: {
          path: './postcss.config.js',
        },
        modules: true,
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
      }),
      styles(),
    ],
  },
  {
    input: "./dist/dts/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
