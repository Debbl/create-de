// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  extends: ["@debbl/eslint-config-vue", "@debbl/eslint-config-prettier"],
});
