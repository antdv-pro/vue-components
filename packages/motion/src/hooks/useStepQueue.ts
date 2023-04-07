import type { Ref } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'
import type {
  StepStatus,
} from '../interface'
import {
  STEP_ACTIVATED,
  STEP_ACTIVE,
  STEP_NONE,
  STEP_PREPARE,
  STEP_START,
} from '../interface'
import useNextFrame from './useNextFrame'

const STEP_QUEUE: StepStatus[] = [
  STEP_PREPARE,
  STEP_START,
  STEP_ACTIVE,
  STEP_ACTIVATED,
]

/** Skip current step */
export const SkipStep = false as const
/** Current step should be update in */
export const DoStep = true as const

export function isActive(step: StepStatus) {
  return step === STEP_ACTIVE || step === STEP_ACTIVATED
}

export default (
  callback: (
    step: StepStatus
  ) => Promise<void> | void | typeof SkipStep | typeof DoStep,
): [() => void, Ref<StepStatus>] => {
  const step = ref<StepStatus>(STEP_NONE)

  function setStep(next: StepStatus) {
    step.value = next
  }

  const [nextFrame, cancelNextFrame] = useNextFrame()

  function startQueue() {
    setStep(STEP_PREPARE)
  }

  watch(step, (step) => {
    if (step !== STEP_NONE && step !== STEP_ACTIVATED) {
      const index = STEP_QUEUE.indexOf(step)
      const nextStep = STEP_QUEUE[index + 1]

      const result = callback(step)

      if (result === SkipStep) {
        // Skip when no needed
        setStep(nextStep)
      }
      else {
        // Do as frame for step update
        nextFrame((info) => {
          function doNext() {
            // Skip since current queue is ood
            if (info.isCanceled()) return

            setStep(nextStep)
          }

          if (result === true) {
            doNext()
          }
          else {
            // Only promise should be async
            Promise.resolve(result).then(doNext)
          }
        })
      }
    }
  })

  onBeforeUnmount(() => {
    cancelNextFrame()
  })

  return [startQueue, step]
}
