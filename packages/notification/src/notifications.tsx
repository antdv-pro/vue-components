import {
  classNames,
  eventType,
  functionType,
  isFunction,
  numberType,
  runEvent,
  someType,
  stringType,
  useState,
} from '@v-c/utils'
import type { CSSProperties, ExtractPropTypes, Ref, VNodeChild } from 'vue'
import { defineComponent, ref, shallowRef, watch } from 'vue'
import type { CSSMotionProps } from '@v-c/motion'
import { CSSMotionList } from '@v-c/motion'
import type { NoticeConfig } from './notice'
import Notice from './notice'
export type Key = string | number
export type OpenConfig = NoticeConfig & {
  key: Key
  placement?: Placement
  content?: VNodeChild | (() => VNodeChild)
  duration?: number | null
}
type InnerOpenConfig = OpenConfig & { times?: number }

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'

export const notificationProps = {
  prefixCls: stringType('vc-notification'),
  placement: stringType('topRight'),
  container: someType<string | HTMLElement>([Object, String], 'body'),
  maxCount: numberType(),
  onAllRemoved: eventType(),
  motion: someType<CSSMotionProps | ((placement: Placement) => CSSMotionProps)>([Object, Function]),
  className: functionType<(placement: Placement) => string>(),
  style: functionType<(placement: Placement) => CSSProperties>(),
}

export type NotificationProps = Partial<ExtractPropTypes<typeof notificationProps>>

type Placements = Partial<Record<Placement, OpenConfig[]>>
const Notifications = defineComponent({
  name: 'Notifications',
  props: {
    ...notificationProps,
  },
  setup(props, { expose }) {
    const configList: Ref<OpenConfig[]> = ref([])
    const onNoticeClose = (key: Key) => {
      const config = configList.value.find(item => item.key === key)
      config?.onClose?.()
      configList.value = configList.value.filter(item => item.key !== key)
    }
    expose({
      open(config: OpenConfig) {
        let clone = [...configList.value]
        const index = clone.findIndex(item => item.key === config.key)
        const innerConfig: InnerOpenConfig = { ...config }
        if (index > -1) {
          innerConfig.times = ((configList.value[index] as InnerOpenConfig).times || 0) + 1
          clone[index] = innerConfig
        }
        else {
          innerConfig.times = 0
          clone.push(innerConfig)
        }
        if (props.maxCount > 0 && clone.length > props.maxCount)
          clone = clone.slice(-props.maxCount)

        configList.value = clone
      },
      close(key: Key) {
        onNoticeClose(key)
      },
      destroy() {
        // 清空所有
        configList.value = []
      },
    })
    // ====================== Placements ======================
    const [placements, setPlacements] = useState<Placements>({})
    watch(configList, () => {
      const nextPlacements: Placements = {}
      configList.value.forEach((config) => {
        const placement = config.placement || 'topRight'
        nextPlacements[placement] = nextPlacements[placement] || []
        nextPlacements[placement]?.push(config)
      })
      Object.keys(placements.value).forEach((placement) => {
        if (placement in nextPlacements) return
        nextPlacements[placement as Placement] = []
      })
      setPlacements(nextPlacements)
    }, {
      deep: true,
      flush: 'post',
      immediate: true,
    })

    const onAllNoticeRemoved = (placement: Placement) => {
      const nextPlacements = { ...placements.value }
      const list = nextPlacements[placement] || []
      if (!list.length)
        delete nextPlacements[placement]
      setPlacements(nextPlacements)
    }
    const emptyRef = shallowRef(false)
    watch(placements, () => {
      if (Object.keys(placements.value).length > 0) {
        emptyRef.value = true
      }
      else if (emptyRef.value) {
        runEvent(props.onAllRemoved)
        emptyRef.value = false
      }
    }, {
      deep: true,
      flush: 'post',
      immediate: true,
    })
    return () => {
      const { motion, className, prefixCls, style } = props
      const NodeList = Object.keys(placements.value).map((placementItem) => {
        const placement = placementItem as Placement
        const placementConfigList = placements.value[placement] || []
        const placementMotion = isFunction(motion) ? motion(placement) : motion
        const keys = placementConfigList.map(config => ({
          config,
          key: config.key,
        }))
        return (<CSSMotionList
            key={placement}
            class={classNames(prefixCls, `${prefixCls}-${placement}`, className?.(placement as Placement))}
            style={style?.(placement)}
            keys={keys}
            motionAppear
            {...placementMotion}
            onAllRemoved={() => onAllNoticeRemoved(placement)}
          >
        </CSSMotionList>)
      })

      return null
    }
  },
})

export default Notifications
