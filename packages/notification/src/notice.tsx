import type { VueKey } from '@v-c/utils'
import {
  KeyCode,
  anyType,
  booleanType,
  classNames,
  eventType,
  isFunction,
  numberType,
  objectType,
  omit,
  someType, stringType, useState, vNodeType,
} from '@v-c/utils'
import type { ExtractPropTypes, HTMLAttributes, VNodeChild } from 'vue'
import { defineComponent, onBeforeUnmount, watch } from 'vue'

export const noticeConfig = {
  content: vNodeType<VNodeChild | (() => VNodeChild)>(),
  duration: numberType(4.5),
  closeIcon: someType<VNodeChild | string | (() => VNodeChild)>([String, Function, Object], 'x'),
  closable: booleanType(),
  /** @private Internal usage. Do not override in your code */
  props: objectType<HTMLAttributes & Record<string, any>>(),
  onClose: eventType<VoidFunction>(),
  onClick: eventType<(e: MouseEvent) => void>(),
  class: anyType(),
  style: anyType(),
}

export type NoticeConfig = Partial<ExtractPropTypes<typeof noticeConfig>>

export const noticeProps = {
  ...omit(noticeConfig, ['onClose']),
  prefixCls: stringType(),
  eventKey: someType<VueKey>([String, Number]),
  onClick: eventType<(e: MouseEvent) => void>(),
  onNoticeClose: eventType<(key: VueKey) => void>(),
}

export type NoticeProps = ExtractPropTypes<typeof noticeProps>

const Notify = defineComponent({
  name: 'Notify',
  props: {
    ...noticeProps,
    times: numberType(),
  },
  setup(props, { attrs, slots, emit }) {
    const [hovering, setHovering] = useState(false)
    // ======================== Close =========================
    const onInternalClose = () => {
      props?.onNoticeClose?.(props.eventKey)
    }

    const onCloseKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === KeyCode.ENTER)
        onInternalClose()
    }

    let timeout: any
    // ======================== Effect ========================
    watch([() => props.duration, () => hovering.value, () => props.times], () => {
      if (!hovering.value && props.duration > 0) {
        timeout = setTimeout(() => {
          onInternalClose()
        }, props.duration * 1000)
      }
    }, {
      immediate: true,
      flush: 'post',
    })
    onBeforeUnmount(() => {
      if (timeout)
        clearTimeout(timeout)
    })

    return () => {
      // ======================== Render ========================
      const { prefixCls, props: divProps, closable, onClick, content, closeIcon } = props
      const noticePrefixCls = `${prefixCls}-notice`
      const divCls = classNames(noticePrefixCls, props.class, {
        [`${noticePrefixCls}-closable`]: closable,
      })
      return (
        <div
         {...attrs}
         {...divProps}
         class={divCls}
         style={props.style}
         onMouseenter={() => {
           setHovering(true)
         }}
         onMouseleave={() => {
           setHovering(false)
         }}
         onClick={onClick}
        >
            <div class={`${noticePrefixCls}-content`}>{isFunction(content) ? content() : content}</div>
            {closable && (
                <a
                   tabindex={0}
                   class={`${noticePrefixCls}-close`}
                   onKeydown={onCloseKeyDown}
                   onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                     onInternalClose()
                   }}
                >{isFunction(closeIcon) ? closeIcon() : closeIcon}</a>
            )}
        </div>
      )
    }
  },
})

export default Notify
