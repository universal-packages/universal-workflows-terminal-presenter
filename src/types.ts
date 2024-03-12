import { TerminalPresenter } from '@universal-packages/terminal-presenter'
import { RoutineGraph, StrategyGraph, Workflow } from '@universal-packages/workflows'

export interface WorkflowTerminalPresenterOptions {
  logEvents?: boolean
  showRoutines?: 'always' | 'pending' | 'running'
  showRoutineSteps?: 'always' | 'routine-active' | 'pending' | 'running'
  showStrategyRoutines?: 'always' | 'strategy-active' | 'pending' | 'running'
  workflow: Workflow
}

export interface RoutineBlockMapItem {
  routineGraph?: RoutineGraph
  strategyGraph?: StrategyGraph
  isStrategyElement?: boolean
}
