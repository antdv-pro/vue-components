import { anyType, booleanType, classNames, someType, stringType } from '@v-c/utils'
import type { ExtractPropTypes, HTMLAttributes } from 'vue'
import { defineComponent, ref, watch } from 'vue'

export const checkboxProps = {
  checked: booleanType(),
  defaultChecked: booleanType(false),
  prefixCls: stringType('rc-checkbox'),
  type: stringType('checkbox'),
  disabled: booleanType(),
  required: booleanType(),
  tabindex: someType<string | number>([String, Number]),
  id: stringType(),
  name: stringType(),
  autofocus: booleanType(),
  value: anyType(),
  readonly: booleanType(),
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
    const checked = ref(props.checked === undefined ? props.defaultChecked : props.checked)
    const inputRef = ref<HTMLInputElement>()
    watch(
      () => props.checked,
      () => {
        checked.value = props.checked
      },
    )
    expose({
      focus() {
        inputRef.value?.focus()
      },

      blur() {
        inputRef.value?.blur()
      },
    })
    const eventShiftKey = ref()
    const handleChange = (e: any) => {
      if (props.disabled)
        return

      if (props.checked === undefined)
        checked.value = e.target.checked

      e.shiftKey = eventShiftKey.value
      const eventObj = {
        target: {
          ...props,
          checked: e.target.checked,
        },
        stopPropagation() {
          e.stopPropagation()
        },
        preventDefault() {
          e.preventDefault()
        },
        nativeEvent: e,
      }

      // fix https://github.com/vueComponent/ant-design-vue/issues/3047
      // 受控模式下维持现有状态
      if (props.checked !== undefined && inputRef.value)
        inputRef.value.checked = !!props.checked

      emit('change', eventObj)
      eventShiftKey.value = false
    }
    const onClick = (e: MouseEvent) => {
      emit('click', e)
      // onChange没能获取到shiftKey，使用onClick hack
      eventShiftKey.value = e.shiftKey
    }
    return () => {
      const {
        prefixCls,
        name,
        id,
        type,
        disabled,
        readonly,
        tabindex,
        autofocus,
        value,
        required,
        ...others
      } = props
      const {
        class: className,
        onFocus,
        onBlur,
        onKeydown,
        onKeypress,
        onKeyup,
      } = attrs as HTMLAttributes
      const othersAndAttrs = { ...others, ...attrs }
      const globalProps = Object.keys(othersAndAttrs).reduce((prev, key) => {
        if (key.startsWith('data-') || key.startsWith('aria-') || key === 'role') {
          // @ts-expect-error this is defined in the if statement
          prev[key] = othersAndAttrs[key]
        }

        return prev
      }, {})

      const classString = classNames(prefixCls, className, {
        [`${prefixCls}-checked`]: checked.value,
        [`${prefixCls}-disabled`]: disabled,
      })
      const inputProps = {
        name,
        id,
        type,
        readonly,
        disabled,
        tabindex,
        class: `${prefixCls}-input`,
        checked: !!checked.value,
        autofocus,
        value,
        ...globalProps,
        onChange: handleChange,
        onClick,
        onFocus,
        onBlur,
        onKeydown,
        onKeypress,
        onKeyup,
        required,
      }

      return (
          <span class={classString}>
          <input ref={inputRef} {...inputProps} />
          <span class={`${prefixCls}-inner`} />
        </span>
      )
    }
  },
})

export default Checkbox
