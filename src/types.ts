export interface Template {
  name: string;
  color?: string;
  children?: Template[];
  url: string;
  git?: {
    init: boolean;
  };
}

export interface Config {
  git: {
    add: boolean;
  };
  templates: Template[];
}
