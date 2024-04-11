import { Logger } from '@universal-packages/logger'
import { EnvironmentTagBlock } from '@universal-packages/logger-terminal-presenter'
import { BlockDescriptor, BrownColor, Color, GrayColor, GreenColor, OrangeColor, RedColor, WhiteColor } from '@universal-packages/terminal-document'
import {
  BlockController,
  LoadingBlock,
  PresenterDocumentDescriptor,
  PresenterRowDescriptor,
  TimeWatchBlock,
  appendRealTimeDocument,
  removeRealTimeDocument,
  updateRealTimeDocument
} from '@universal-packages/terminal-presenter'
import { RoutineGraph, Status, StrategyGraph, Workflow, WorkflowGraph } from '@universal-packages/workflows'

import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'
import { RoutineBlockMapItem, WorkflowTerminalPresenterOptions } from './types'

export default class WorkflowTerminalPresenter {
  public readonly options: WorkflowTerminalPresenterOptions

  private workflow: Workflow
  private hooked = false

  private stepsLastOutputs: Record<string, Record<string, string>> = {}
  private logger: Logger

  public constructor(options: WorkflowTerminalPresenterOptions) {
    this.options = {
      showRoutines: 'always',
      showRoutineSteps: 'running',
      showStrategyRoutines: 'strategy-active',
      terminalPresenterAccess: 'local',
      ...options
    }

    this.workflow = this.options.workflow
    this.logger = this.options.logger
  }

  public present() {
    if (this.hooked) return
    this.hooked = true

    if (this.options.logger) {
      this.workflow.on('running', (event) => {
        this.logger.log(
          {
            level: 'QUERY',
            title: `Workflow ${this.workflow.name ? `"${this.workflow.name}"` : ''} started`,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('success', (event) => {
        this.logger.log(
          {
            level: 'INFO',
            title: `Workflow ${this.workflow.name ? `"${this.workflow.name}"` : ''} succeeded`,
            measurement: event.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('failure', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Workflow ${this.workflow.name ? `"${this.workflow.name}"` : ''} failed`,
            measurement: event.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('error', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Workflow ${this.workflow.name ? `"${this.workflow.name}"` : ''} errored`,
            error: event.error,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('stopping', (event) => {
        this.logger.log(
          {
            level: 'QUERY',
            title: `Workflow ${this.workflow.name ? `"${this.workflow.name}"` : ''} stopping`,
            metadata: this.eventPayloadWithoutGraphKeys(event)
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('stopped', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Workflow ${this.workflow.name ? `"${this.workflow.name}"` : ''} stopped`,
            measurement: event.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })

      this.workflow.on('routine:running', (event) => {
        this.logger.log(
          {
            level: 'QUERY',
            title: `Routine ${event.payload.name} started`,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('routine:success', (event) => {
        this.logger.log(
          {
            level: 'INFO',
            title: `Routine ${event.payload.name} succeeded`,
            measurement: event.payload.graph.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('routine:failure', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Routine ${event.payload.name} failed`,
            measurement: event.payload.graph.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('routine:error', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Routine ${event.payload.name} errored`,
            error: event.error,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('routine:stopping', (event) => {
        this.logger.log(
          {
            level: 'QUERY',
            title: `Routine ${event.payload.name} stopping`,
            metadata: this.eventPayloadWithoutGraphKeys(event)
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('routine:stopped', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Routine ${event.payload.name} stopped`,
            measurement: event.payload.graph.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })

      this.workflow.on('step:running', (event) => {
        this.logger.log(
          {
            level: 'QUERY',
            title: `Step ${event.payload.graph.command || event.payload.graph.usable} started`,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('step:success', (event) => {
        this.logger.log(
          {
            level: 'INFO',
            title: `Step ${event.payload.graph.command || event.payload.graph.usable} succeeded`,
            measurement: event.payload.graph.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('step:failure', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Step ${event.payload.graph.command || event.payload.graph.usable} failed`,
            measurement: event.payload.graph.measurement,
            message: event.payload.graph.output,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('step:error', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Step ${event.payload.graph.command || event.payload.graph.usable} errored`,
            error: event.error,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('step:stopping', (event) => {
        this.logger.log(
          {
            level: 'QUERY',
            title: `Step ${event.payload.graph.command || event.payload.graph.usable} stopping`,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
      this.workflow.on('step:stopped', (event) => {
        this.logger.log(
          {
            level: 'ERROR',
            title: `Step ${event.payload.graph.command || event.payload.graph.usable} stopped`,
            measurement: event.payload.graph.measurement,
            metadata: this.eventPayloadWithoutGraphKeys(event),
            category: 'WORKFLOWS'
          },
          LOG_CONFIGURATION
        )
      })
    }

    this.workflow.on('**', (event) => {
      const graph = this.workflow.graph

      if (event.event === 'step:output') {
        if (!this.stepsLastOutputs[event.payload.routine]) this.stepsLastOutputs[event.payload.routine] = {}
        this.stepsLastOutputs[event.payload.routine][event.payload.index] = event.payload.data
      }

      if (this.options.terminalPresenterAccess === 'core') {
        global['core'].terminalPresenter.updateRealTimeDocument('WORKFLOW-DOC', this.generateWorkflowDocument(graph))
      } else {
        updateRealTimeDocument('WORKFLOW-DOC', this.generateWorkflowDocument(graph))
      }
    })

    this.workflow.on('end', () => {
      if (this.options.terminalPresenterAccess === 'core') {
        global['core'].terminalPresenter.removeRealTimeDocument('WORKFLOW-DOC')
      } else {
        removeRealTimeDocument('WORKFLOW-DOC')
      }

      this.workflow.removeAllListeners()
    })

    if (this.options.terminalPresenterAccess === 'core') {
      global['core'].terminalPresenter.appendRealTimeDocument('WORKFLOW-DOC', this.generateWorkflowDocument(this.workflow.graph))
    } else {
      appendRealTimeDocument('WORKFLOW-DOC', this.generateWorkflowDocument(this.workflow.graph))
    }
  }

  private generateWorkflowDocument(graph: WorkflowGraph): PresenterDocumentDescriptor {
    const primaryColor = LOG_CONFIGURATION.categoryBackgroundColor as Color

    const rowDescriptors: PresenterRowDescriptor[] = []

    const workflowHeadBlocks: (BlockController | BlockDescriptor)[] = []
    const workflowHeadRow: PresenterRowDescriptor = {
      border: [true, false, false, false],
      borderStyle: 'double',
      borderColor: primaryColor,
      blocks: workflowHeadBlocks
    }

    workflowHeadBlocks.push(LoadingBlock())
    workflowHeadBlocks.push({ text: ' ', width: 'fit' })
    workflowHeadBlocks.push({
      color: primaryColor,
      style: 'bold',
      text: this.workflow.name || 'Workflow',
      width: 'fit'
    })

    workflowHeadBlocks.push({ text: ' ' })

    workflowHeadBlocks.push({ backgroundColor: primaryColor, style: 'bold', text: ' WORKFLOWS ', width: 'fit' })
    workflowHeadBlocks.push({ text: ' ', width: 'fit' })

    if (process.env.NODE_ENV) {
      workflowHeadBlocks.push(EnvironmentTagBlock())
      workflowHeadBlocks.push({ text: ' ', width: 'fit' })
    }

    if (this.workflow.startedAt) {
      workflowHeadBlocks.push(TimeWatchBlock({ initialTime: this.workflow.startedAt?.getTime(), targetTime: this.workflow.endedAt?.getTime() }))
    }

    rowDescriptors.push(workflowHeadRow)

    // MIDDLE ROW ===============================================================
    rowDescriptors.push({ blocks: [{ text: ' ' }] })

    const routineBlockMapItems: RoutineBlockMapItem[][] = []

    for (let i = 0; i < graph.routines.length; i++) {
      const currentLevelRoutines = graph.routines[i]
      const levelMapItems: RoutineBlockMapItem[] = []

      for (let j = 0; j < currentLevelRoutines.length; j++) {
        const currentRoutineGraph = currentLevelRoutines[j]

        if (currentRoutineGraph['strategy']) {
          const strategyRunning = currentRoutineGraph['strategy'].some((routine: RoutineGraph) => [Status.Running, Status.Stopping].includes(routine.status))
          const strategyIdPending = currentRoutineGraph['strategy'].some((routine: RoutineGraph) => [Status.Running, Status.Stopping, Status.Idle].includes(routine.status))
          const shouldShowRoutine =
            this.options.showRoutines === 'always' || (this.options.showRoutines === 'pending' && strategyIdPending) || (this.options.showRoutines === 'running' && strategyRunning)

          if (shouldShowRoutine) {
            levelMapItems.push({ strategyGraph: currentRoutineGraph as StrategyGraph })

            for (let k = 0; k < currentRoutineGraph['strategy'].length; k++) {
              const strategyRoutineGraph = currentRoutineGraph['strategy'][k] as RoutineGraph
              const routineIsRunning = [Status.Running, Status.Stopping].includes(strategyRoutineGraph.status)
              const routineIsPending = [Status.Running, Status.Stopping, Status.Idle].includes(strategyRoutineGraph.status)
              const shouldShowStrategyRoutine =
                this.options.showStrategyRoutines === 'always' ||
                (this.options.showStrategyRoutines === 'strategy-active' && strategyRunning) ||
                (this.options.showStrategyRoutines === 'pending' && routineIsPending) ||
                (this.options.showStrategyRoutines === 'running' && routineIsRunning)

              if (shouldShowStrategyRoutine || strategyRoutineGraph.status === Status.Failure) {
                levelMapItems.push({ routineGraph: strategyRoutineGraph, isStrategyElement: true })
              }
            }
          }
        } else {
          const routineIsRunning = [Status.Running, Status.Stopping].includes(currentRoutineGraph['status'])
          const routineIsPending = [Status.Running, Status.Stopping, Status.Idle].includes(currentRoutineGraph['status'])
          const shouldShowRoutine =
            this.options.showRoutines === 'always' || (this.options.showRoutines === 'pending' && routineIsPending) || (this.options.showRoutines === 'running' && routineIsRunning)

          if (shouldShowRoutine) levelMapItems.push({ routineGraph: currentRoutineGraph as RoutineGraph })
        }
      }

      routineBlockMapItems.push(levelMapItems)
    }

    for (let i = 0; i < routineBlockMapItems.length; i++) {
      const currentRoutineBlockMapItems = routineBlockMapItems[i]

      for (let j = 0; j < currentRoutineBlockMapItems.length; j++) {
        const currentRoutineBlockMapItem = currentRoutineBlockMapItems[j]
        const currentRowBlocks: (BlockController | BlockDescriptor)[] = []
        const currentRow: PresenterRowDescriptor = { blocks: currentRowBlocks }

        if (currentRoutineBlockMapItem.routineGraph) {
          if (currentRoutineBlockMapItem.isStrategyElement) currentRowBlocks.push({ text: '  ', width: 'fit' })

          if (currentRoutineBlockMapItem.isStrategyElement) {
            const strategyIndexMatch = currentRoutineBlockMapItem.routineGraph.name.match(/\[(\d+)\]$/g)
            const strategyIndex = strategyIndexMatch ? Number(strategyIndexMatch[0].replace(/\[|\]/g, '')) : 0

            this.generateLevelBadge(currentRowBlocks, strategyIndex, true)
          } else {
            this.generateLevelBadge(currentRowBlocks, i + 1, routineBlockMapItems.length > 1)
          }

          let badgeBackgroundColor: Color

          if (currentRoutineBlockMapItem.routineGraph.status === Status.Idle) {
            badgeBackgroundColor = GrayColor.Gray
          } else if (currentRoutineBlockMapItem.routineGraph.status === Status.Running) {
            badgeBackgroundColor = BrownColor.DarkGoldenrod
          } else if (currentRoutineBlockMapItem.routineGraph.status === Status.Success) {
            badgeBackgroundColor = GreenColor.Green
          } else if (currentRoutineBlockMapItem.routineGraph.status === Status.Failure) {
            badgeBackgroundColor = RedColor.DarkRed
          }

          currentRowBlocks.push({
            backgroundColor: badgeBackgroundColor,
            color: WhiteColor.White,
            style: 'bold',
            text: ' ROUTINE ',
            width: 'fit'
          })

          if (currentRoutineBlockMapItem.routineGraph.status === Status.Stopping) {
            currentRowBlocks.push({ text: ' ', width: 'fit' })
            currentRowBlocks.push(LoadingBlock({ style: 'star' }))
          } else if (currentRoutineBlockMapItem.routineGraph.status === Status.Running) {
            currentRowBlocks.push({ text: ' ', width: 'fit' })
            currentRowBlocks.push(LoadingBlock())
          }

          currentRowBlocks.push({
            color: OrangeColor.Coral,
            style: 'bold',
            height: 1,
            padding: [0, 1, 0, 1],
            text: currentRoutineBlockMapItem.routineGraph.name,
            width: 'fit'
          })

          if (currentRoutineBlockMapItem.routineGraph.startedAt) {
            currentRowBlocks.push(
              TimeWatchBlock({ initialTime: currentRoutineBlockMapItem.routineGraph.startedAt.getTime(), targetTime: currentRoutineBlockMapItem.routineGraph.endedAt?.getTime() })
            )
          } else {
            currentRowBlocks.push({ text: '--', width: 'fit' })
          }
        } else {
          this.generateLevelBadge(currentRowBlocks, i + 1, routineBlockMapItems.length > 1)

          const strategySuccess = currentRoutineBlockMapItem.strategyGraph.strategy.every((routine) => routine.status === Status.Success)
          const strategyFailure = currentRoutineBlockMapItem.strategyGraph.strategy.some((routine) => [Status.Failure, Status.Stopped].includes(routine.status))
          const strategyRunning = currentRoutineBlockMapItem.strategyGraph.strategy.some((routine) => [Status.Running, Status.Stopping].includes(routine.status))
          let badgeBackgroundColor: Color

          if (strategySuccess) {
            badgeBackgroundColor = GreenColor.Green
          } else if (strategyFailure) {
            badgeBackgroundColor = RedColor.DarkRed
          } else if (strategyRunning) {
            badgeBackgroundColor = OrangeColor.OrangeRed
          } else {
            badgeBackgroundColor = GrayColor.Gray
          }

          currentRowBlocks.push({
            backgroundColor: badgeBackgroundColor,
            color: WhiteColor.White,
            style: 'bold',
            text: ' STRATEGY ',
            width: 'fit'
          })

          currentRowBlocks.push({ text: ' ', width: 'fit' })

          if (strategyRunning) currentRowBlocks.push(LoadingBlock())

          currentRowBlocks.push({
            color: OrangeColor.OrangeRed,
            style: ['bold', 'italic'],
            height: 1,
            padding: [0, 1, 0, 1],
            text: currentRoutineBlockMapItem.strategyGraph.name,
            width: 'fit'
          })

          const strategyEarliestStartAt = currentRoutineBlockMapItem.strategyGraph.strategy.reduce((earliestStartAt, routine) => {
            if (routine.startedAt && earliestStartAt === 0) return routine.startedAt.getTime()
            if (routine.startedAt && routine.startedAt.getTime() < earliestStartAt) return routine.startedAt.getTime()
            return earliestStartAt
          }, 0)

          if (strategyEarliestStartAt) {
            const strategyLastEndAt =
              currentRoutineBlockMapItem.strategyGraph.strategy.reduce((lastEndAt, routine) => {
                if (routine.endedAt && routine.endedAt.getTime() > lastEndAt) return routine.endedAt.getTime()
                return lastEndAt
              }, 0) || undefined

            currentRowBlocks.push(TimeWatchBlock({ initialTime: strategyEarliestStartAt, targetTime: strategyRunning ? undefined : strategyLastEndAt }))
          } else {
            currentRowBlocks.push({ text: '--', width: 'fit' })
          }
        }

        if (j < currentRoutineBlockMapItems.length - 1) {
          currentRowBlocks.push({ text: ' ' })
        }

        rowDescriptors.push(currentRow)

        const routineSteps = currentRoutineBlockMapItem.routineGraph?.steps

        if (routineSteps) {
          let stepsWereRendered = false

          for (let k = 0; k < routineSteps.length; k++) {
            const currentStep = routineSteps[k]
            const routineIsActive = [Status.Running, Status.Stopping].includes(currentRoutineBlockMapItem.routineGraph.status)
            const stepIsRunning = [Status.Running, Status.Stopping].includes(currentStep.status)
            const stepIsPending = [Status.Running, Status.Stopping, Status.Idle].includes(currentStep.status)
            const shouldShowStep =
              this.options.showRoutineSteps === 'always' ||
              (this.options.showRoutineSteps === 'routine-active' && routineIsActive) ||
              (this.options.showRoutineSteps === 'pending' && stepIsPending) ||
              (this.options.showRoutineSteps === 'running' && stepIsRunning)

            if (shouldShowStep || currentStep.status === Status.Failure) {
              stepsWereRendered = true

              const currentRowBlocks: (BlockController | BlockDescriptor)[] = []
              const currentRow: PresenterRowDescriptor = { blocks: currentRowBlocks }
              const indentationSize = routineBlockMapItems.length > 1 ? 4 : 2

              if (currentRoutineBlockMapItem.isStrategyElement) {
                currentRowBlocks.push({ text: ' '.repeat(indentationSize + 2), width: 'fit' })
              } else {
                currentRowBlocks.push({ text: ' '.repeat(indentationSize), width: 'fit' })
              }

              this.generateLevelBadge(currentRowBlocks, k + 1, routineSteps.length > 1)

              let badgeBackgroundColor: Color

              if (currentStep.status === Status.Idle) {
                badgeBackgroundColor = GrayColor.Gray
              } else if (currentStep.status === Status.Running) {
                badgeBackgroundColor = BrownColor.DarkGoldenrod
              } else if (currentStep.status === Status.Success) {
                badgeBackgroundColor = GreenColor.Green
              } else if (currentStep.status === Status.Failure) {
                badgeBackgroundColor = RedColor.DarkRed
              }

              currentRowBlocks.push({
                backgroundColor: badgeBackgroundColor,
                color: WhiteColor.White,
                style: 'bold',
                text: ' STEP ',
                width: 'fit'
              })

              if (currentStep.status === Status.Stopping) {
                currentRowBlocks.push({ text: ' ', width: 'fit' })
                currentRowBlocks.push(LoadingBlock({ style: 'star' }))
              } else if (currentStep.status === Status.Running) {
                currentRowBlocks.push({ text: ' ', width: 'fit' })
                currentRowBlocks.push(LoadingBlock())
              }

              if (currentStep.name) {
                currentRowBlocks.push({
                  height: 1,
                  padding: [0, 1, 0, 1],
                  text: currentStep.name,
                  width: 'fit'
                })
                currentRowBlocks.push({ text: ' ', width: 'fit' })
              }

              currentRowBlocks.push({
                height: 1,
                padding: [0, 1, 0, 1],
                text: currentStep.command || currentStep.usable,
                width: 'fit'
              })

              if (currentStep.startedAt) {
                currentRowBlocks.push(TimeWatchBlock({ initialTime: currentStep.startedAt.getTime(), targetTime: currentStep.endedAt?.getTime() }))
              } else {
                currentRowBlocks.push({ text: '--', width: 'fit' })
              }

              rowDescriptors.push(currentRow)
            }
          }

          if (stepsWereRendered) {
            {
              rowDescriptors.push({ blocks: [{ text: ' ' }] })
            }
          }
        }
      }
    }

    // END ROW ===============================================================

    rowDescriptors.push({
      border: [false, false, true, false],
      borderStyle: 'double',
      borderColor: primaryColor,
      blocks: [{ text: ' ' }]
    })

    return { rows: rowDescriptors }
  }

  private generateLevelBadge(rowBlocks: (BlockController | BlockDescriptor)[], level: number, theresMoreLevels: boolean): void {
    if (theresMoreLevels) {
      rowBlocks.push({
        color: GrayColor.Gainsboro,
        style: ['bold', 'inverse'],
        text: ` ${level} `,
        width: 'fit'
      })
      rowBlocks.push({ text: ' ', width: 'fit' })
    }
  }

  private eventPayloadWithoutGraphKeys(event: Record<string, any>): Record<string, any> {
    if (!event.payload) return
    const payload = { ...event.payload }

    delete payload.graph

    if (Object.keys(payload).length === 0) return

    return payload
  }
}
