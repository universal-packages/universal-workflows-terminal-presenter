import { BlockDescriptor, BlueColor, BrownColor, Color, GrayColor, GreenColor, OrangeColor, RedColor, WhiteColor } from '@universal-packages/terminal-document'
import { DocumentDescriptor, TerminalDocument } from '@universal-packages/terminal-document'
import { BlockController, LoadingBlock, PresenterDocumentDescriptor, PresenterRowDescriptor, TerminalPresenter, TimeWatch } from '@universal-packages/terminal-presenter'
import { RoutineGraph, Status, StrategyGraph, Workflow, WorkflowGraph } from '@universal-packages/workflows'

import { RoutineBlockMapItem, WorkflowTerminalPresenterOptions } from './types'

export default class WorkflowTerminalPresenter {
  public readonly options: WorkflowTerminalPresenterOptions

  private readonly terminalPresenter: TerminalPresenter
  private myTerminalPresenter: boolean = false

  private workflow: Workflow
  private hooked = false

  private stepsLastOutputs: Record<string, Record<string, string>> = {}

  public constructor(options: WorkflowTerminalPresenterOptions) {
    this.options = {
      logEvents: true,
      showRoutines: 'always',
      showRoutineSteps: 'running',
      showStrategyRoutines: 'strategy-active',
      ...options
    }

    this.terminalPresenter = this.options.terminalPresenter

    if (!this.terminalPresenter) {
      this.terminalPresenter = new TerminalPresenter()
      this.myTerminalPresenter = true
    }

    this.workflow = this.options.workflow
  }

  public present() {
    if (this.hooked) return
    this.hooked = true

    if (this.options.logEvents) {
      this.workflow.on('running', () => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: BlueColor.SteelBlue,
                  color: WhiteColor.AliceBlue,
                  style: 'bold',
                  text: ' WORKFLOW ',
                  width: 'fit'
                },
                { text: ` ${this.workflow.name || ''}`, width: 'fit' },
                { style: 'bold', text: ' Running ', width: 'fit' },
                { text: this.formatTime(this.workflow.startedAt), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('success', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: GreenColor.Green,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' WORKFLOW ',
                  width: 'fit'
                },
                { text: ` ${this.workflow.name || ''}`, width: 'fit' },
                { style: 'bold', text: ' Success ', width: 'fit' },
                { text: this.formatTime(this.workflow.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('failure', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkRed,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' WORKFLOW ',
                  width: 'fit'
                },
                { text: ` ${this.workflow.name || ''}`, width: 'fit' },
                { style: 'bold', text: ' Failure ', width: 'fit' },
                { text: this.formatTime(this.workflow.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('stopping', () => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkSalmon,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' WORKFLOW ',
                  width: 'fit'
                },
                { text: ` ${this.workflow.name || ''}`, width: 'fit' },
                { style: 'bold', text: ' Stopping ', width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('stopped', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkRed,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' WORKFLOW ',
                  width: 'fit'
                },
                { text: ` ${this.workflow.name || ''}`, width: 'fit' },
                { style: 'bold', text: ' Stopped ', width: 'fit' },
                { text: this.formatTime(this.workflow.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })

      this.workflow.on('routine:running', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: BrownColor.DarkGoldenrod,
                  color: WhiteColor.AliceBlue,
                  style: 'bold',
                  text: ' ROUTINE  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.name}`, width: 'fit' },
                { style: 'bold', text: ' Running ', width: 'fit' },
                { text: this.formatTime(event.payload.startedAt), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('routine:success', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: GreenColor.Green,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' ROUTINE  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.name}`, width: 'fit' },
                { style: 'bold', text: ' Success ', width: 'fit' },
                { text: this.formatTime(event.payload.graph.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.payload.graph.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('routine:failure', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkRed,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' ROUTINE  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.name}`, width: 'fit' },
                { style: 'bold', text: ' Failure ', width: 'fit' },
                { text: this.formatTime(event.payload.graph.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.payload.graph.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('routine:stopping', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkSalmon,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' ROUTINE  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.name}`, width: 'fit' },
                { style: 'bold', text: ' Stopping ', width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('routine:stopped', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkRed,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' ROUTINE  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.name}`, width: 'fit' },
                { style: 'bold', text: ' Stopped ', width: 'fit' },
                { text: this.formatTime(event.payload.graph.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.payload.graph.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })

      this.workflow.on('step:running', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: BrownColor.DarkGoldenrod,
                  color: WhiteColor.AliceBlue,
                  style: 'bold',
                  text: ' STEP  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.graph.command || event.payload.graph.usable} ${event.payload.routine}-${event.payload.index + 1}`, width: 'fit' },
                { style: 'bold', text: ' Running ', width: 'fit' },
                { text: this.formatTime(event.payload.startedAt), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('step:success', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: GreenColor.Green,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' STEP  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.graph.command || event.payload.graph.usable} ${event.payload.routine}-${event.payload.index}`, width: 'fit' },
                { style: 'bold', text: ' Success ', width: 'fit' },
                { text: this.formatTime(event.payload.graph.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.payload.graph.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('step:failure', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkRed,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' STEP  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.graph.command || event.payload.graph.usable} ${event.payload.routine}-${event.payload.index}`, width: 'fit' },
                { style: 'bold', text: ' Failure ', width: 'fit' },
                { text: this.formatTime(event.payload.graph.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.payload.graph.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
        this.logDocument({
          rows: [
            {
              blocks: [
                { text: '  ', width: 'fit' },
                {
                  color: RedColor.DarkRed,
                  text: event.payload.graph.output
                }
              ]
            }
          ]
        })
      })
      this.workflow.on('step:stopping', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkSalmon,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' STEP  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.graph.command || event.payload.graph.usable} ${event.payload.routine}-${event.payload.index}`, width: 'fit' },
                { style: 'bold', text: ' Stopping ', width: 'fit' }
              ]
            }
          ]
        })
      })
      this.workflow.on('step:stopped', (event) => {
        this.logDocument({
          rows: [
            {
              blocks: [
                {
                  backgroundColor: RedColor.DarkRed,
                  color: WhiteColor.White,
                  style: 'bold',
                  text: ' STEP  ',
                  width: 'fit'
                },
                { text: ` ${event.payload.graph.command || event.payload.graph.usable} ${event.payload.routine}-${event.payload.index}`, width: 'fit' },
                { style: 'bold', text: ' Stopped ', width: 'fit' },
                { text: this.formatTime(event.payload.graph.endedAt), width: 'fit' },
                { text: ' ', width: 'fit' },
                { text: event.payload.graph.measurement.toString(), width: 'fit' }
              ]
            }
          ]
        })
      })
    }

    this.workflow.on('**', (event) => {
      const graph = this.workflow.graph

      if (event.event === 'step:output') {
        if (!this.stepsLastOutputs[event.payload.routine]) this.stepsLastOutputs[event.payload.routine] = {}
        this.stepsLastOutputs[event.payload.routine][event.payload.index] = event.payload.data
      }

      this.terminalPresenter.updateDocument('workflow', this.generateWorkflowDocument(graph))
    })

    this.workflow.on('end', () => {
      setTimeout(() => {
        this.terminalPresenter.removeDocument('workflow')
        this.workflow.removeAllListeners()
        if (this.myTerminalPresenter) this.terminalPresenter.stop()
      }, 1000)
    })

    this.terminalPresenter.appendDocument('workflow', this.generateWorkflowDocument(this.workflow.graph))

    if (this.myTerminalPresenter) this.terminalPresenter.start()
  }

  private generateWorkflowDocument(graph: WorkflowGraph): PresenterDocumentDescriptor {
    const rowDescriptors: PresenterRowDescriptor[] = []

    const workflowHeadBlocks: (BlockController | BlockDescriptor)[] = []
    const workflowHeadRow: PresenterRowDescriptor = {
      border: [true, false, true, false],
      borderStyle: 'dash-2',
      borderColor: BlueColor.SteelBlue,
      blocks: workflowHeadBlocks
    }

    workflowHeadBlocks.push({ backgroundColor: BlueColor.SteelBlue, color: WhiteColor.AliceBlue, style: 'bold', text: ' WORKFLOW ', width: 'fit' })
    workflowHeadBlocks.push({ text: ' ', width: 'fit' })

    if ([Status.Running, Status.Stopping].includes(this.workflow.status)) {
      workflowHeadBlocks.push(LoadingBlock())
    }

    workflowHeadBlocks.push({ style: 'italic', text: ` ${this.workflow.name} `, width: 'fit' })

    if (this.workflow.startedAt) {
      workflowHeadBlocks.push(TimeWatch({ initialTime: this.workflow.startedAt?.getTime(), targetTime: this.workflow.endedAt?.getTime() }))
    }

    workflowHeadBlocks.push({ text: ' ' })

    rowDescriptors.push(workflowHeadRow)

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
              TimeWatch({ initialTime: currentRoutineBlockMapItem.routineGraph.startedAt.getTime(), targetTime: currentRoutineBlockMapItem.routineGraph.endedAt?.getTime() })
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

            currentRowBlocks.push(TimeWatch({ initialTime: strategyEarliestStartAt, targetTime: strategyRunning ? undefined : strategyLastEndAt }))
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
                currentRowBlocks.push(TimeWatch({ initialTime: currentStep.startedAt.getTime(), targetTime: currentStep.endedAt?.getTime() }))
              } else {
                currentRowBlocks.push({ text: '--', width: 'fit' })
              }

              rowDescriptors.push(currentRow)

              if (
                [Status.Running, Status.Failure].includes(currentStep.status) &&
                this.stepsLastOutputs[currentRoutineBlockMapItem.routineGraph.name] &&
                this.stepsLastOutputs[currentRoutineBlockMapItem.routineGraph.name][k]
              ) {
                const lastOutputRowBlocks: (BlockController | BlockDescriptor)[] = []

                if (currentRoutineBlockMapItem.isStrategyElement) {
                  lastOutputRowBlocks.push({ text: ' '.repeat(indentationSize + 4), width: 'fit' })
                } else {
                  lastOutputRowBlocks.push({ text: ' '.repeat(indentationSize + 2), width: 'fit' })
                }

                lastOutputRowBlocks.push({
                  color: currentStep.status === Status.Failure ? RedColor.DarkRed : undefined,
                  height: 1,
                  text: this.stepsLastOutputs[currentRoutineBlockMapItem.routineGraph.name][k],
                  width: 'fit'
                })
                rowDescriptors.push({ blocks: lastOutputRowBlocks })
              }
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

  private formatTime(date?: Date): string {
    const currentDate = date || new Date()
    const hours = currentDate.getHours()
    const minutes = currentDate.getMinutes()
    const seconds = currentDate.getSeconds()
    const formattedHours = hours < 10 ? `0${hours}` : hours.toString()
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString()
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString()

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
  }

  private logDocument(documentDescriptor: DocumentDescriptor): void {
    const document = new TerminalDocument()
    document.describe(documentDescriptor)
    this.terminalPresenter.log(document.result)
  }
}
