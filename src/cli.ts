import { cac } from "cac";
import consola from "consola";
import { version } from "../package.json";
import { run } from ".";

const cli = cac("create-de");

cli.command("[name]", "Create a new project").action((name) => {
  run({ name }).catch((err) => err && consola.error(err));
});

cli.help().version(version).parse();
