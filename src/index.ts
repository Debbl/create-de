import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { intro, isCancel, select, spinner, text } from "@clack/prompts";
import consola from "consola";
import { downloadTemplate } from "giget";
import config from "./config";
import type { Template } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function chooseTemplate(templates: Template[]) {
  const template = await select({
    message: "Choose a template",
    options: templates.map((t) => ({
      label: t.name,
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

  const templatePath = path.join(__dirname, customName);

  const s = spinner();

  s.start("Downloading template...");
  await downloadTemplate(template.url, {
    provider: "github",
    dir: templatePath,
  });
  s.stop("Downloaded template finished");

  const relativePath = path.relative(__dirname, templatePath);
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
