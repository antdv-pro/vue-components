import type { CSSMotionProps } from '@v-c/motion'
import type { CSSProperties, VNodeChild } from 'vue'
import type { VueKey } from '@v-c/utils'
import { useState } from '@v-c/utils'
import { defineComponent, onMounted, shallowRef, watch } from 'vue'
import Notifications from './notifications'
import type { NotificationsRef, OpenConfig, Placement } from './notifications'

const defaultGetContainer = () => document.body

type OptionalConfig = Partial<OpenConfig>

export interface NotificationConfig {
  prefixCls?: string
  /** Customize container. It will repeat call which means you should return same container element. */
  getContainer?: () => HTMLElement
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps)
  closeIcon?: VNodeChild | (() => VNodeChild)
  closable?: boolean
  maxCount?: number
  duration?: number
  /** @private. Config for notification holder style. Safe to remove if refactor */
  className?: (placement: Placement) => string
  /** @private. Config for notification holder style. Safe to remove if refactor */
  style?: (placement: Placement) => CSSProperties
  /** @private Trigger when all the notification closed. */
  onAllRemoved?: VoidFunction
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void
  close: (key: VueKey) => void
  destroy: () => void
}

interface OpenTask {
  type: 'open'
  config: OpenConfig
}

interface CloseTask {
  type: 'close'
  key: VueKey
}

interface DestroyTask {
  type: 'destroy'
}

type Task = OpenTask | CloseTask | DestroyTask

let uniqueKey = 0

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone: T = {} as T

  objList.forEach((obj) => {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        const val = (obj as any)[key]

        if (val !== undefined)
          (clone as any)[key] = val
      })
    }
  })
  return clone
}

export default function useNotification(
  rootConfig: NotificationConfig = {},
) {
  const {
    getContainer = defaultGetContainer,
    motion,
    prefixCls,
    maxCount,
    className,
    style,
    onAllRemoved,
    ...shareConfig
  } = rootConfig

  const [container, setContainer] = useState<HTMLElement>()
  const notificationRef = shallowRef<NotificationsRef>()
  const contextHolder = defineComponent({
    name: 'NotificationHolder',
    setup() {
      return () => (
          <Notifications
              container={container.value}
              ref={notificationRef}
              prefixCls={prefixCls}
              motion={motion}
              maxCount={maxCount}
              className={className}
              style={style}
              onAllRemoved={onAllRemoved}
          />
      )
    },
  })
  const [taskQueue, setTaskQueue] = useState<Task[]>([])

  // ========================= Refs =========================
  const api: NotificationAPI = {
    open: (config) => {
      const mergedConfig = mergeConfig(shareConfig, config)
      if (mergedConfig.key === null || mergedConfig.key === undefined) {
        mergedConfig.key = `vc-notification-${uniqueKey}`
        uniqueKey += 1
      }

      setTaskQueue(queue => [...(queue ?? []), { type: 'open', config: mergedConfig }])
    },
    close: (key) => {
      setTaskQueue(queue => [...queue, { type: 'close', key }])
    },
    destroy: () => {
      setTaskQueue(queue => [...queue, { type: 'destroy' }])
    },
  }
  // ======================= Container ======================
  // React 18 should all in effect that we will check container in each render
  // Which means getContainer should be stable.
  onMounted(() => {
    setContainer(getContainer())
  })

  watch(taskQueue, () => {
    // Flush task when node ready
    if (notificationRef.value && taskQueue.value.length) {
      taskQueue.value.forEach((task) => {
        switch (task.type) {
          case 'open':
            notificationRef.value?.open(task.config)
            break

          case 'close':
            notificationRef.value?.close(task.key)
            break

          case 'destroy':
            notificationRef.value?.destroy()
            break
        }
      })

      setTaskQueue([])
    }
  }, { immediate: true, flush: 'post' })

  // ======================== Return ========================
  return [api, contextHolder]
}
