import { type VueKey, classNames, eventType, functionType, isFunction, numberType, useState } from '@v-c/utils'
import { someType, stringType, vNodeType } from '@v-c/utils'
import { Teleport, defineComponent, shallowRef, watch } from 'vue'
import type { CSSProperties, ExtractPropTypes, VNodeChild } from 'vue'
import type { CSSMotionProps } from '@v-c/motion'
import { CSSMotionList } from '@v-c/motion'
import type { NoticeConfig } from './notice'
import Notice, { noticeConfig } from './notice'

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'
export const openConfig = {
  ...noticeConfig,
  key: someType<VueKey>([String, Number]),
  placement: stringType<Placement>(),
  content: vNodeType<VNodeChild | (() => VNodeChild)>(),
  duration: numberType(),
}

type Placements = Partial<Record<Placement, OpenConfig[]>>

export type OpenConfig = Partial<ExtractPropTypes<typeof openConfig>>

export const notificationProps = {
  prefixCls: stringType(),
  motion: someType<CSSMotionProps | ((placement: Placement) => CSSMotionProps)>([Object, Function]),
  container: someType<HTMLElement | (() => HTMLElement)>([Object, Function]),
  maxCount: numberType(),
  onAllRemoved: eventType<VoidFunction>(),
  className: functionType<(placement: Placement) => string>(),
  style: functionType<(placement: Placement) => CSSProperties>(),
}

type InnerOpenConfig = OpenConfig & { times?: number }

export interface NotificationsRef {
  open: (config: OpenConfig) => void
  close: (key: VueKey) => void
  destroy: () => void
}

const Notification = defineComponent({
  name: 'Notification',
  props: notificationProps,
  setup(props, { expose }) {
    const [configList, setConfigList] = useState<OpenConfig[]>([])
    // ======================== Close =========================
    const onNoticeClose = (key: VueKey) => {
      // Trigger close event
      const config = configList.value.find(item => item.key === key)
      config?.onClose?.()

      setConfigList(list => list.filter(item => item.key !== key))
    }
    // ========================= Refs =========================
    expose({
      open: (config: OpenConfig) => {
        setConfigList((list) => {
          let clone = [...list]
          // Replace if exist
          const index = clone.findIndex(item => item.key === config.key)
          const innerConfig: InnerOpenConfig = { ...config }
          if (index >= 0) {
            innerConfig.times = ((list[index] as InnerOpenConfig)?.times || 0) + 1
            clone[index] = innerConfig
          }
          else {
            innerConfig.times = 0
            clone.push(innerConfig)
          }

          if (props.maxCount > 0 && clone.length > props.maxCount)
            clone = clone.slice(-props.maxCount)

          return clone
        })
      },
      close: (key: VueKey) => {
        onNoticeClose(key)
      },
      destroy: () => {
        setConfigList([])
      },
    })

    // ====================== Placements ======================
    const [placements, setPlacements] = useState<Placements>({})

    watch(configList, () => {
      const nextPlacements: Placements = {}

      configList.value.forEach((config) => {
        const { placement = 'topRight' } = config

        if (placement) {
          nextPlacements[placement] = nextPlacements[placement] || []
          nextPlacements[placement].push(config)
        }
      })

      // Fill exist placements to avoid empty list causing remove without motion
      Object.keys(placements.value).forEach((placement) => {
        nextPlacements[placement as Placement] = nextPlacements[placement as Placement] || []
      })

      setPlacements(nextPlacements)
    })

    // Clean up container if all notices fade out
    const onAllNoticeRemoved = (placement: Placement) => {
      setPlacements((originPlacements) => {
        const clone = {
          ...originPlacements,
        }
        const list = clone[placement] || []

        if (!list.length)
          delete clone[placement]

        return clone
      })
    }

    // Effect tell that placements is empty now
    const emptyRef = shallowRef(false)
    watch(placements, () => {
      if (Object.keys(placements.value).length > 0) {
        emptyRef.value = true
      }
      else if (emptyRef.value) {
        // Trigger only when from exist to empty
        props?.onAllRemoved?.()
        emptyRef.value = false
      }
    }, {
      immediate: true,
      flush: 'post',
    })

    return () => {
      // ======================== Render ========================
      const { container, motion, prefixCls = 'vc-notification', className, style } = props
      if (!container)
        return null

      const placementList = Object.keys(placements.value) as Placement[]
      const nodes = placementList.map((placement) => {
        const placementConfigList = placements.value[placement] || []
        const keys: any[] = placementConfigList.map(config => ({
          config,
          key: config.key,
        }))
        const placementMotion = isFunction(motion) ? motion(placement) : motion
        return (
            <div
                key={placement}
                class={classNames(prefixCls, `${prefixCls}-${placement}`, className?.(placement))}
                style={style?.(placement)}
            >
              <CSSMotionList
                  keys={keys}
                  motionAppear
                  {...placementMotion}
                  onAllRemoved={() => {
                    onAllNoticeRemoved(placement)
                  }}
              >
                {{
                  default: ({ config, class: motionClassName, style: motionStyle, ref: nodeRef }: any) => {
                    const { key, times } = config as InnerOpenConfig
                    const { class: configClassName, style: configStyle } = config as NoticeConfig
                    return (
                        <Notice
                            {...config}
                            ref={nodeRef}
                            prefixCls={prefixCls}
                            class={classNames(motionClassName, configClassName)}
                            style={{ ...motionStyle, ...configStyle }}
                            times={times}
                            key={key}
                            eventKey={key}
                            onNoticeClose={onNoticeClose}
                        />
                    )
                  },
                }}
              </CSSMotionList>
            </div>

        )
      })
      const holder = (isFunction(container) ? container() : container) ?? 'body'
      return (
        <Teleport to={holder}>
            {nodes}
        </Teleport>
      )
    }
  },
})

export default Notification
