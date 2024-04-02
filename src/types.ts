import { Logger } from '@universal-packages/logger'
import { TerminalPresenter } from '@universal-packages/terminal-presenter'
import { RoutineGraph, StrategyGraph, Workflow } from '@universal-packages/workflows'

export interface WorkflowTerminalPresenterOptions {
  logger?: Logger
  showRoutines?: 'always' | 'pending' | 'running'
  showRoutineSteps?: 'always' | 'routine-active' | 'pending' | 'running'
  showStrategyRoutines?: 'always' | 'strategy-active' | 'pending' | 'running'
  TerminalPresenter?: typeof TerminalPresenter
  workflow: Workflow
}

export interface RoutineBlockMapItem {
  routineGraph?: RoutineGraph
  strategyGraph?: StrategyGraph
  isStrategyElement?: boolean
}
