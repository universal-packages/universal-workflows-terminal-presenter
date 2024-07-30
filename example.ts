import { Logger } from '@universal-packages/logger'
import { present, restore } from '@universal-packages/terminal-presenter'
import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from './src'

async function doIt() {
  present()

  const logger = new Logger({ level: 'QUERY', transports: ['terminal-presenter'] })
  await logger.prepare()

  const workflow = Workflow.buildFrom('sleep-good')
  const workflowTerminalPresenter = new WorkflowTerminalPresenter({ logger, workflow })

  workflowTerminalPresenter.present()

  await workflow.run()

  process.on('SIGINT', async () => {
    await workflow.stop()
    await restore()
    process.exit(0)
  })

  await restore()
}

doIt()
