import minimist from "minimist";
import { reset } from "kolorist";
import prompts from "prompts";
import { formatTargetDir } from "./utils/utils";

const argv = minimist(process.argv.slice(2));
const defaultTargetDir = "my-project";

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  let targetDir = argTargetDir || defaultTargetDir;
  const response = await prompts([
    {
      type: argTargetDir ? null : "text",
      name: "projectName",
      message: reset("Project Name:"),
      onState: (state) => {
        targetDir = formatTargetDir(state.value) || defaultTargetDir;
      },
    },
  ]);
  console.log(targetDir);

  console.log(response);
}

init();
