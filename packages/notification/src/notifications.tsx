import type { Ref, VNodeChild } from 'vue'
import { defineComponent, ref } from 'vue'
import type { NoticeConfig } from './notice'
export type Key = string | number | Symbol
export type OpenConfig = NoticeConfig & {
  key: Key
  placement?: Placement
  content?: VNodeChild | (() => VNodeChild)
  duration?: number | null
}

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'

type Placements = Partial<Record<Placement, OpenConfig[]>>
const Notifications = defineComponent({
  name: 'Notifications',
  setup(props, { expose }) {
    const configList: Ref<OpenConfig[]> = ref([])
    const onNoticeClose = (key: Key) => {
      const config = configList.value.find(item => item.key === key)
      config?.onClose?.()
      configList.value = configList.value.filter(item => item.key !== key)
    }
    expose({
      open() {

      },
      close(key: Key) {
        onNoticeClose(key)
      },
      destroy() {
        // 清空所有
      },
    })
    return () => {
      return null
    }
  },
})

export default Notifications
