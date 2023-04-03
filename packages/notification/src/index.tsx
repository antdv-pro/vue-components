import { booleanType, classNames, someType, stringType, useVModel } from '@v-c/utils'
import type { ExtractPropTypes } from 'vue'
import { defineComponent, ref } from 'vue'

export const checkboxProps = {
  checked: booleanType(),
  defaultChecked: booleanType(false),
  prefixCls: stringType('vc-checkbox'),
  type: stringType('checkbox'),
  disabled: booleanType(),
  required: booleanType(),
  tabindex: someType<string | number>([String, Number]),
  id: stringType(),
  name: stringType(),
  autofocus: booleanType(),
}

export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>
const Checkbox = defineComponent({
  name: 'Checkbox',
  inheritAttrs: false,
  props: {
    ...checkboxProps,
  },
  emits: ['change', 'click'],
  setup(props, { attrs, emit, expose }) {
    const inputRef = ref<HTMLInputElement>()
    const rowChecked = useVModel(props, 'checked', emit, {
      defaultValue: props.checked === undefined ? props.defaultChecked : props.checked,
    })
    const eventShiftKey = ref()
    const handleChange = (e: any) => {
      if (props.disabled)
        return
      if (props.checked === undefined)
        rowChecked.value = (e.target as any)?.checked
      e.shiftKey = eventShiftKey.value
      const eventObj = {
        target: {
          ...props,
          checked: rowChecked.value,
        },
        stopPropagation() {
          e.stopPropagation()
        },
        preventDefault() {
          e.preventDefault()
        },
        nativeEvent: e,
      }
      if (props.checked !== undefined) {
        // @ts-expect-error this is a bug
        inputRef.value?.checked = !!props.checked
      }
      emit('change', eventObj)
      eventShiftKey.value = false
    }

    const onClick = (e: any) => {
      emit('click', e)
      eventShiftKey.value = e.shiftKey
    }
    expose({
      focus() {
        inputRef.value?.focus()
      },
      blur() {
        inputRef.value?.blur()
      },
    })
    return () => {
      const {
        prefixCls,
        type,
        disabled,
        ...otherProps
      } = props
      const { class: cls, style } = (attrs as any)
      const classString = classNames(
        prefixCls,
        cls,
        {
          [`${prefixCls}-checked`]: rowChecked.value,
          [`${prefixCls}-disabled`]: disabled,
        },
      )
      return <span class={classString} style={style}>
          <input
            ref={inputRef}
            {...attrs}
            {...otherProps}
            type={type}
            class={`${prefixCls}-input`}
            disabled={disabled}
            checked={!!rowChecked.value}
            onChange={handleChange}
            onClick={onClick}
          />
        <span class={`${prefixCls}-inner`} />
      </span>
    }
  },
})

export default Checkbox
