# Workflows Terminal Presenter

[![npm version](https://badge.fury.io/js/@universal-packages%2Fworkflows-terminal-presenter.svg)](https://www.npmjs.com/package/@universal-packages/workflows-terminal-presenter)
[![Testing](https://github.com/universal-packages/universal-workflows-terminal-presenter/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-workflows-terminal-presenter/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-workflows-terminal-presenter/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-workflows-terminal-presenter)

Universal workflows terminal presenter.

## Install

```shell
npm install @universal-packages/workflows-terminal-presenter

npm install @universal-packages/workflows
npm install @universal-packages/terminal-presenter
```

## WorkflowTerminalPresenter

The presenter makes use of a [TerminalPresenter](https://github.com/universal-packages/universal-terminal-presenter) to show a graph of the status of a workflow. You can either pass an instance of a `TerminalPresenter` or let the `WorkflowTerminalPresenter` create one for you.

```js
import { Workflow } from '@universal-packages/workflows'
import { WorkflowTerminalPresenter } from '@universal-packages/workflows-terminal-presenter'

const workflow = Workflow.buildFrom('fast-sleep-good')
const workflowTerminalPresenter = new WorkflowTerminalPresenter({ workflow })

workflowTerminalPresenter.present()

await workflow.run()
```

##### Options

- **`logger`** `Logger`
  A logger instance to use to visualize workflow events.

- **`showRoutines`** `'always' | 'pending' | 'running'` `default: 'always'`
  Show routines in the graph, `always` will always show them, `pending` will show them when they are not done, `running` will show them when they are running.

- **`showRoutineSteps`** `'always' | 'routine-active' | 'pending' | 'running'` `default: 'always'`
  Show routine steps in the graph, `always` will always show them, `routine-active` will show them when the routine is active, `pending` will show them when they are not done, `running` will show them when they are running.

- **`showStrategyRoutines`** `'always' | 'strategy-active' | 'pending' | 'running'` `default: 'always'`
  Show strategy routines in the graph, `always` will always show them, `strategy-active` will show them when the strategy is active, `pending` will show them when they are not done, `running` will show them when they are running.

- **`TerminalPresenter`** `TerminalPresenter`
  The terminal presenter to use to present the graph.

- **`workflow`** `Workflow`
  The required workflow to present.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
