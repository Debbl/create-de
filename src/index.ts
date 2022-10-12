import path from "node:path";
import fs from "node:fs";
import minimist from "minimist";
import { blue, green, reset } from "kolorist";
import prompts from "prompts";
import { emptyDir, formatTargetDir, isEmpty } from "./utils/utils";

type ColorFunc = (str: string | number) => string;
interface FrameworkVariant {
  name: string;
  display: string;
  color: ColorFunc;
  customCommand?: string;
}
interface Framework {
  name: string;
  display: string;
  color: ColorFunc;
  variants: FrameworkVariant[];
}

const argv = minimist<{
  t?: string;
  template?: string;
}>(process.argv.slice(2));
const defaultTargetDir = "my-project";
const cwd = process.cwd();
const FRAMEWORKS: Framework[] = [
  {
    name: "vue",
    display: "Vue",
    color: green,
    variants: [
      {
        name: "vue-ts",
        display: "Typescript",
        color: blue,
      },
    ],
  },
];

const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  let targetDir = argTargetDir || defaultTargetDir;

  let result: prompts.Answers<"projectName" | "overwrite" | "framework">;
  result = await prompts([
    {
      type: argTargetDir ? null : "text",
      name: "projectName",
      message: reset("Project Name:"),
      initial: defaultTargetDir,
      onState: (state) => {
        targetDir = formatTargetDir(state.value) || defaultTargetDir;
      },
    },
    {
      type: () =>
        !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
      name: "overwrite",
      message: () =>
        targetDir === "."
          ? "Current directory"
          : `Target directory "${targetDir}"` +
            " is not empty. Remove existing files and continue?",
    },
    {
      type: argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
      name: "framework",
      message:
        typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate)
          ? reset(
              `"${argTemplate}" isn't a valid template. Please choose from below`
            )
          : reset("Select a framework:"),
      initial: 0,
      choices: FRAMEWORKS.map((f) => {
        const fc = f.color;
        return {
          title: fc(f.display || f.name),
          value: f,
        };
      }),
    },
  ]);
  const { projectName, overwrite, framework } = result;
  console.log(result, projectName, framework, targetDir, process.cwd());
  const root = path.join(cwd, targetDir);
  console.log(root);
  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
}

init();
