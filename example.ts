import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from './src'

async function doIt() {
  const workflow = Workflow.buildFrom('fast-sleep-good')
  const workflowTerminalPresenter = new WorkflowTerminalPresenter({
    workflow
  })

  workflowTerminalPresenter.present()

  await workflow.run()
}

doIt()
