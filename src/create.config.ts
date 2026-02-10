import type { Config } from './types'

const config: Config = {
  git: {
    add: true,
  },
  templates: [
    {
      name: 'starter-ts',
      color: '#3178c6',
      url: 'debbl/starter-ts',
    },
    {
      name: 'starter-react',
      color: '#61DAFB',
      url: 'debbl/starter-react',
    },
    {
      name: 'starter-next-app',
      color: '#0a0a0a',
      url: 'debbl/starter-next-app',
    },
    {
      name: 'starter-electron-app',
      color: '#4285f4',
      url: 'debbl/starter-electron-app',
    },
    {
      name: 'starter-sass',
      color: '#cc6699',
      url: 'debbl/starter-sass',
    },
    {
      name: 'starter-worker',
      color: '#e6873c',
      url: 'debbl/starter-worker',
    },
  ],
}

export default config
