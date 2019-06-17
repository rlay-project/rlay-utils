import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import hashbang from "rollup-plugin-hashbang";
import json from "rollup-plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import { terser } from "rollup-plugin-terser";

const env = process.env.NODE_ENV;

const buildConfig = (inFile, outFile) => {
  const config = {
    input: inFile,
    external: ["react", "react-dom"],
    output: {
      file: outFile,
      format: "cjs",
      name: "npmPackageES6Boilerplate"
    },

    plugins: [
      hashbang(),
      nodeResolve(),
      babel({
        exclude: "**/node_modules/**",
        externalHelpers: false,
        runtimeHelpers: true
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify(env)
      }),
      json(),
      commonjs()
    ]
  };

  if (env === "production") {
    config.plugins.push(
      terser({
        output: {},
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    );
  }

  return config;
};

const config = [
  buildConfig(
    "./src/commands/seed_from_file.js",
    "./lib/bin/seed_from_file.js"
  ),
  buildConfig(
    "./src/commands/dump_ontology_to_file.js",
    "./lib/bin/dump_ontology_to_file.js"
  ),
  buildConfig(
    "./src/commands/redis-sync-search.js",
    "./lib/bin/redis-sync-search.js"
  )
];

export default config;
