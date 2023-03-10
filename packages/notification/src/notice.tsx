import { defineComponent, onBeforeUnmount, shallowRef, watchEffect } from 'vue'
import { KeyCode, anyType, booleanType, eventType, numberType, stringType, vNodeType } from '@v-c/utils'
import classNames from 'classnames'
const noticeProps = {
  content: vNodeType(),
  duration: numberType(4.5),
  closable: booleanType(),
  closeIcon: vNodeType(),
  // onClose: eventType(),
  onClick: eventType<((e: Event) => void)>(),
  prefixCls: stringType(),
  eventKey: anyType(),
  onNoticeClose: eventType<(key: any) => void>(),
  times: numberType(),
}
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
    watchEffect(() => {
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
      } = props
      const noticePrefixCls = `${prefixCls}-notice`

      return (
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
    }
  },
})

export default notice
