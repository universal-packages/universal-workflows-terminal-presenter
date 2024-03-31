import { Logger } from '@universal-packages/logger'
import { TerminalPresenter } from '@universal-packages/terminal-presenter'
import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from './src'

async function doIt() {
  const logger = new Logger({ transports: ['terminal'] })
  await logger.prepare()

  TerminalPresenter.start()

  const workflow = Workflow.buildFrom('sleep-good')
  const workflowTerminalPresenter = new WorkflowTerminalPresenter({ logger, workflow })

  workflowTerminalPresenter.present()

  await workflow.run()

  await TerminalPresenter.stop()
}

doIt()
