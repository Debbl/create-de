import type { Config } from "./types";

const config: Config = {
  git: {
    add: true,
  },
  templates: [
    {
      name: "starter-ts",
      color: "#3178c6",
      url: "debbl/starter-ts",
    },
    {
      name: "starter-react",
      color: "#61DAFB",
      url: "debbl/starter-react",
    },
    {
      name: "starter-next-app",
      color: "#000000",
      url: "debbl/starter-next-app",
    },
    {
      name: "starter-electron-app",
      color: "#4285f4",
      url: "debbl/starter-electron-app",
    },
  ],
};

export default config;
