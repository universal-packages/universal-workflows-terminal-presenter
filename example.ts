import { Logger } from '@universal-packages/logger'
import { TerminalPresenter } from '@universal-packages/terminal-presenter'
import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from './src'

async function doIt() {
  const terminalPresenter = new TerminalPresenter()
  terminalPresenter.present()

  const logger = new Logger({ transports: ['terminal-presenter'] })
  await logger.prepare()

  const workflow = Workflow.buildFrom('sleep-good')
  const workflowTerminalPresenter = new WorkflowTerminalPresenter({ logger, workflow })

  workflowTerminalPresenter.present()

  await workflow.run()

  process.on('SIGINT', async () => {
    await workflow.stop()
    await terminalPresenter.restore()
    process.exit(0)
  })

  await terminalPresenter.restore()
}

doIt()
