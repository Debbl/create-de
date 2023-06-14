import { execSync } from "node:child_process";

export default function gitCommitInit(execPath: string) {
  const execSyncGit = (command: string) => {
    return execSync(command, { cwd: execPath });
  };
  try {
    execSyncGit("git --version");
    execSyncGit('git init && git add . && git commit -m "chore: init"');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
}
