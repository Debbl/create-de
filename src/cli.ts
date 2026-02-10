import { cac } from 'cac'
import consola from 'consola'
import { run } from '.'
import { version } from '../package.json'

const cli = cac('create-de')

cli.command('[name]', 'Create a new project').action((name) => {
  run({ name }).catch((err) => err && consola.error(err))
})

cli.help().version(version).parse()
