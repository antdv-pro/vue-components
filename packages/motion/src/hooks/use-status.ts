import { useState } from '@v-c/utils'
import type { CSSProperties, ComputedRef, Ref } from 'vue'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import type { CSSMotionProps } from '../css-motion'
import type { MotionEvent, MotionStatus, StepStatus } from '../interface'
import {
  STATUS_APPEAR,
  STATUS_ENTER,
  STATUS_LEAVE,
  STATUS_NONE,
  STEP_ACTIVE,
  STEP_PREPARE,
  STEP_PREPARED,
  STEP_START,
} from '../interface'
import useDomMotionEvents from './use-dom-motion-events'
import useIsomorphicLayoutEffect from './use-lsomorphic-layout-effect'
import useStepQueue, { DoStep, SkipStep, isActive } from './use-step-queue'

export default function useStatus(
  supportMotion: Ref<boolean>,
  visible: Ref<boolean>,
  getElement: () => HTMLElement | null,
  props: CSSMotionProps,
): [Ref<MotionStatus>, Ref<StepStatus>, ComputedRef<CSSProperties>, Ref<boolean>] {
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  const [asyncVisible, setAsyncVisible] = useState<boolean>()
  const [status, setStatus] = useState<MotionStatus>(STATUS_NONE)
  const [style, setStyle] = useState<CSSProperties | undefined | null>(null)

  const mountedRef = shallowRef(false)
  const deadlineRef = shallowRef(null)

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement()!
  }

  // ========================== Motion End ==========================
  const activeRef = shallowRef(false)

  /**
     * Clean up status & style
     */
  function updateMotionEndStatus() {
    setStatus(STATUS_NONE)
    setStyle(null)
  }

  function onInternalMotionEnd(event: MotionEvent) {
    const element = getDomElement()
    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return
    }

    const currentActive = activeRef.value

    let canEnd: any
    if (status.value === STATUS_APPEAR && currentActive)
      canEnd = props.onAppearEnd?.(element, event)
    else if (status.value === STATUS_ENTER && currentActive)
      canEnd = props.onEnterEnd?.(element, event)
    else if (status.value === STATUS_LEAVE && currentActive)
      canEnd = props.onLeaveEnd?.(element, event)

    // Only update status when `canEnd` and not destroyed
    if (status.value !== STATUS_NONE && currentActive && canEnd !== false)
      updateMotionEndStatus()
  }

  const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd)

  // ============================= Step =============================
  const eventHandlers = computed(() => {
    switch (status.value) {
      case STATUS_APPEAR:
        return {
          [STEP_PREPARE]: props.onAppearPrepare,
          [STEP_START]: props.onAppearStart,
          [STEP_ACTIVE]: props.onAppearActive,
        }

      case STATUS_ENTER:
        return {
          [STEP_PREPARE]: props.onEnterPrepare,
          [STEP_START]: props.onEnterStart,
          [STEP_ACTIVE]: props.onEnterActive,
        }

      case STATUS_LEAVE:
        return {
          [STEP_PREPARE]: props.onLeavePrepare,
          [STEP_START]: props.onLeaveStart,
          [STEP_ACTIVE]: props.onLeaveActive,
        }

      default:
        return {}
    }
  })

  const [startStep, step] = useStepQueue(status, supportMotion, (newStep) => {
    // Only prepare step can be skip
    if (newStep === STEP_PREPARE) {
      const onPrepare = eventHandlers.value[STEP_PREPARE]
      if (!onPrepare)
        return SkipStep

      return onPrepare(getDomElement())
    }

    // Rest step is sync update
    if (step.value in eventHandlers.value)
      setStyle((eventHandlers.value as any)[step.value]?.(getDomElement(), null) || null)

    if (step.value === STEP_ACTIVE) {
      // Patch events when motion needed
      patchMotionEvents(getDomElement())

      if (props.motionDeadline! > 0) {
        clearTimeout(deadlineRef.value!)
        // @ts-expect-error this is a bug in typescript
        deadlineRef.value = setTimeout(() => {
          onInternalMotionEnd({
            deadline: true,
          } as MotionEvent)
        }, props.motionDeadline)
      }
    }

    if (step.value === STEP_PREPARED)
      updateMotionEndStatus()

    return DoStep
  })
  watch(step, () => {
    activeRef.value = isActive(step.value)
  }, { immediate: true })

  // ============================ Status ============================
  // Update with new status
  useIsomorphicLayoutEffect(() => {
    setAsyncVisible(visible.value)

    const isMounted = mountedRef.value
    mountedRef.value = true

    if (!supportMotion.value)
      return

    let nextStatus: MotionStatus

    // Appear
    if (!isMounted && visible.value && props.motionAppear)
      nextStatus = STATUS_APPEAR

    // Enter
    if (isMounted && visible.value && props.motionEnter)
      nextStatus = STATUS_ENTER

    // Leave
    if (
      (isMounted && !visible.value && props.motionLeave)
            || (!isMounted && props.motionLeaveImmediately && !visible.value && props.motionLeave)
    )
      nextStatus = STATUS_LEAVE

    // Update to next status
    if (nextStatus!) {
      setStatus(nextStatus)
      startStep()
    }
  }, [visible])

  // ============================ Effect ============================
  // Reset when motion changed
  watch([() => props.motionAppear, () => props.motionEnter, () => props.motionLeave], () => {
    if (
    // Cancel appear
      (status.value === STATUS_APPEAR && !props.motionAppear)
            // Cancel enter
            || (status.value === STATUS_ENTER && !props.motionEnter)
            // Cancel leave
            || (status.value === STATUS_LEAVE && !props.motionLeave)
    )
      setStatus(STATUS_NONE)
  }, { immediate: true })
  onBeforeUnmount(() => {
    mountedRef.value = false
    clearTimeout(deadlineRef.value!)
  })

  // Trigger `onVisibleChanged`
  const firstMountChangeRef = shallowRef(false)
  watch([asyncVisible, status], () => {
    if (asyncVisible.value)
      firstMountChangeRef.value = true

    if (asyncVisible.value !== undefined && status.value === STATUS_NONE) {
      // Skip first render is invisible since it's nothing changed
      if (firstMountChangeRef.value || asyncVisible.value)
        props.onVisibleChanged?.(asyncVisible.value)

      firstMountChangeRef.value = true
    }
  }, { immediate: true })

  // ============================ Styles ============================
  const mergedStyle = computed(() => {
    let mergedStyle = style.value
    if (eventHandlers.value[STEP_PREPARE] && step.value === STEP_START) {
      mergedStyle = {
        transition: 'none',
        ...mergedStyle,
      }
    }
    return mergedStyle!
  })

  return [status, step, mergedStyle, asyncVisible ?? visible]
}
