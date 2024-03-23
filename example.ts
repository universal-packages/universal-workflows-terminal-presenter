import { TerminalPresenter } from '@universal-packages/terminal-presenter'
import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from './src'

async function doIt() {
  TerminalPresenter.start()

  const workflow = Workflow.buildFrom('sleep-good')
  const workflowTerminalPresenter = new WorkflowTerminalPresenter({
    workflow
  })

  workflowTerminalPresenter.present()

  await workflow.run()

  TerminalPresenter.stop()
}

doIt()
