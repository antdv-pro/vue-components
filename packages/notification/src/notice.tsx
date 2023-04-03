import type { ExtractPropTypes } from 'vue'
import { Teleport, defineComponent, onBeforeUnmount, shallowRef, watchPostEffect } from 'vue'
import {
  KeyCode,
  anyType,
  booleanType,
  classNames,
  eventType,
  functionType,
  numberType,
  stringType,
  vNodeType,
} from '@v-c/utils'

const noticeProps = {
  content: vNodeType(),
  duration: numberType(4.5),
  closable: booleanType(),
  closeIcon: vNodeType(),
  onClose: functionType(),
  onClick: eventType<((e: Event) => void)>(),
  prefixCls: stringType(),
  eventKey: anyType(),
  onNoticeClose: eventType<(key: any) => void>(),
  times: numberType(),
  holder: anyType<HTMLDivElement>(),
}
export type NoticeConfig = Partial<ExtractPropTypes<typeof noticeProps>>
const notice = defineComponent({
  name: 'Notice',
  props: {
    ...noticeProps,
  },
  setup(props, { attrs }) {
    const hovering = shallowRef(false)
    const setHovering = (value: boolean) => {
      hovering.value = value
    }

    // ======================== Close =========================
    const onInternalClose = () => {
      props.onNoticeClose?.(props?.eventKey)
    }

    const onCloseKeyDown = (e: any) => {
      if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === KeyCode.ENTER)
        onInternalClose()
    }
    let timeout: any
    watchPostEffect(() => {
      if (props.times) {
        // TODO
      }
      if (!hovering.value && props.duration > 0) {
        timeout = setTimeout(() => {
          onInternalClose()
        }, props.duration * 1000)
      }
    })
    onBeforeUnmount(() => {
      if (timeout)
        clearTimeout(timeout)
    })
    return () => {
      const {
        prefixCls,
        content,
        closable,
        closeIcon = 'x',
        onClick,
        holder,
      } = props
      const noticePrefixCls = `${prefixCls}-notice`

      const node = (
          <div
              class={classNames(noticePrefixCls, (attrs as any).class, {
                [`${noticePrefixCls}-closable`]: closable,
              })}
              onMouseenter={() => {
                setHovering(true)
              }}
              onMouseleave={() => {
                setHovering(false)
              }}
              onClick={onClick}
          >
            {/* Content */}
            <div class={`${noticePrefixCls}-content`}>{content}</div>

            {/* Close Icon */}
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
                >
                  {closeIcon}
                </a>
            )}
          </div>
      )

      if (holder)
        return <Teleport to={holder}> { node }</Teleport>
      return node
    }
  },
})

export default notice
