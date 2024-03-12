import { writeStdout } from '@universal-packages/terminal-presenter/writeStdout'
import { Workflow } from '@universal-packages/workflows'

import { WorkflowTerminalPresenter } from '../src'

// Because we are using spawn not test targets, test targets use timers
jest.useFakeTimers()

jest.mock('@universal-packages/terminal-presenter/writeStdout', () => ({ writeStdout: jest.fn() }))
jest.mock('ansi-escapes', () => ({
  clearTerminal: 'clearTerminal',
  cursorHide: 'cursorHide',
  eraseDown: 'eraseDown',
  eraseLine: 'eraseLine',
  cursorMove: jest.fn((x, y) => `cursorMove(${x},${y})`),
  cursorShow: 'cursorShow'
}))

process.stdout.columns = 80

describe(WorkflowTerminalPresenter, (): void => {
  it('throws if use not implemented', async (): Promise<void> => {
    const writeStdoutMock = writeStdout as jest.Mock

    const workflow = Workflow.buildFrom('fast-sleep-good')
    const workflowTerminalPresenter = new WorkflowTerminalPresenter({ workflow })

    workflowTerminalPresenter.present()

    workflow.on('**', () => {
      jest.advanceTimersToNextTimer()
    })

    await workflow.run()

    jest.advanceTimersToNextTimer()

    expect(writeStdoutMock).toHaveBeenCalled()
  })
})
