import path from "node:path";
import { intro, isCancel, select, spinner, text } from "@clack/prompts";
import ansis from "ansis";
import consola from "consola";
import { downloadTemplate } from "giget";
import config from "./config";
import type { Template } from "./types";

// eslint-disable-next-line n/prefer-global/process
const cwd = process.cwd();

async function chooseTemplate(templates: Template[]) {
  const template = await select({
    message: "Choose a template",
    options: templates.map((t) => ({
      label: ansis.hex(t.color)(t.name),
      value: t,
    })),
  });
  if (isCancel(template)) {
    throw new Error("Cancelled");
  }

  return template;
}

async function create(template: Template) {
  const customName = await text({
    defaultValue: template.name,
    message: "Enter a custom name for the project",
  });

  if (isCancel(customName)) {
    throw new Error("Cancelled");
  }

  const templatePath = path.join(cwd, customName);

  const s = spinner();

  s.start("Downloading template...");
  await downloadTemplate(template.url, {
    provider: "github",
    dir: templatePath,
  });
  s.stop("Downloaded template finished");

  const relativePath = path.relative(cwd, templatePath);
  consola.success(`Created project ${customName} at ${relativePath}\n`);
  consola.info(`cd ${relativePath}`);
}

export async function run({ name }: { name?: string }) {
  intro(`Create a new project`);

  let templates = config.templates.find((i) => i.name === name);
  if (!templates) {
    templates = await chooseTemplate(config.templates);
  }

  await create(templates);
}
