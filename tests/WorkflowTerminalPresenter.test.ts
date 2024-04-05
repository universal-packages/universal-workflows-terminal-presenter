import { Logger } from '@universal-packages/logger'
import { TerminalPresenter } from '@universal-packages/terminal-presenter'
import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from '../src'

jest.mock('@universal-packages/terminal-presenter/TerminalPresenter', () => ({
  firstInstance: {
    appendRealTimeDocument: jest.fn(),
    updateRealTimeDocument: jest.fn(),
    printDocument: jest.fn()
  }
}))

describe(WorkflowTerminalPresenter, (): void => {
  it('throws if use not implemented', async (): Promise<void> => {
    const appendMock = TerminalPresenter.firstInstance.appendRealTimeDocument as jest.Mock
    const updateMock = TerminalPresenter.firstInstance.updateRealTimeDocument as jest.Mock
    const printMock = TerminalPresenter.firstInstance.printDocument as jest.Mock

    const logger = new Logger({ transports: ['terminal-presenter'] })
    await logger.prepare()

    const workflow = Workflow.buildFrom('fast-sleep-good', { allowDescribedTargetsOnTest: true })
    const workflowTerminalPresenter = new WorkflowTerminalPresenter({ logger, workflow })

    workflowTerminalPresenter.present()

    await workflow.run()

    expect(appendMock.mock.calls).toMatchObject([
      [
        'WORKFLOW-DOC',
        {
          rows: [
            {
              border: [true, false, false, false],
              borderStyle: 'double',
              borderColor: 'olive-drab',
              blocks: [
                { descriptor: { id: 'loading-component-0', color: 'dodger-blue', text: '⣷', style: 'bold', width: 'fit' } },
                { text: ' ', width: 'fit' },
                { color: 'olive-drab', style: 'bold', text: 'Sleep good', width: 'fit' },
                { text: ' ' },
                { backgroundColor: 'olive-drab', style: 'bold', text: ' WORKFLOWS ', width: 'fit' },
                { text: ' ', width: 'fit' },
                {
                  descriptor: {
                    id: 'environment-tag-0',
                    backgroundColor: 'medium-violet-red',
                    color: 'white',
                    style: 'bold',
                    text: ' TEST ',
                    verticalAlign: 'middle',
                    width: 'fit'
                  }
                },
                { text: ' ', width: 'fit' },
                { descriptor: { id: 'time-watch-component-0', text: '00s', style: 'bold', width: 'fit' } }
              ]
            },
            { blocks: [{ text: ' ' }] },
            { border: [false, false, true, false], borderStyle: 'double', borderColor: 'olive-drab', blocks: [{ text: ' ' }] }
          ]
        }
      ]
    ])

    expect(updateMock).toHaveBeenCalledTimes(69)
    expect(printMock).toHaveBeenCalledTimes(50)
  })
})
