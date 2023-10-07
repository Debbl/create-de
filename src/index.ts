import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import { blue, cyan, green, lightGray, red, reset } from "kolorist";
import prompts from "prompts";
import {
  copy,
  emptyDir,
  formatTargetDir,
  isEmpty,
  isValidPackageName,
  pkgFromUserAgent,
} from "./utils/utils";

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
    name: "react",
    display: "React",
    color: cyan,
    variants: [
      {
        name: "react-ts",
        display: "Typescript",
        color: blue,
      },
      {
        name: "next-app-ts",
        display: "Next-Ts",
        color: lightGray,
      },
    ],
  },
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
  {
    name: "node",
    display: "Node",
    color: green,
    variants: [
      {
        name: "node-ts",
        display: "Node-Ts",
        color: blue,
      },
    ],
  },
  {
    name: "solid",
    display: "Solid",
    color: blue,
    variants: [
      {
        name: "solid-ts-tailwindcss",
        display: "Typescript + Tailwindcss",
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
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    "projectName" | "overwrite" | "packageName" | "framework" | "variant"
  >;

  try {
    result = await prompts(
      [
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
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(`${red("✖")} Operation cancelled`);
            }
            return null;
          },
          name: "overwriteChecker",
          message: "",
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
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
        {
          type: (framework: Framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: reset("Select a variant:"),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(`${red("✖")} Operation cancelled`);
        },
      }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    return;
  }

  // user choice associated with prompts
  const { framework, overwrite, packageName, variant } = result!;

  const root = path.join(cwd, targetDir);

  // mkdir root
  if (overwrite) {
    emptyDir(root);
  } else {
    fs.mkdirSync(root, { recursive: true });
  }

  // template
  const template: string = variant || framework?.name || argTemplate;
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates",
    `template-${template}`
  );

  const renameFiles: Record<string, string | undefined> = {
    _gitignore: ".gitignore",
  };
  // write target path
  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }
  // package.json
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, "package.json"), "utf-8")
  );
  pkg.name = packageName || getProjectName();
  write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

  // done
  const cdProjectName = path.relative(cwd, root);
  // eslint-disable-next-line no-console
  console.log("\nDone. Now run:\n");
  if (root !== cwd) {
    // eslint-disable-next-line no-console
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`
    );
  }
  // eslint-disable-next-line no-console
  console.log(`  ${pkgManager} install`);
  // eslint-disable-next-line no-console
  console.log(`  ${pkgManager} dev`);
}

init();
