import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  clean: true,
  outDir: "dist",
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
});
