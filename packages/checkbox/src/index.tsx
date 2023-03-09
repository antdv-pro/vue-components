import { booleanType, eventType, stringType } from '@v-c/utils'
import classNames from 'classnames'
import type { ExtractPropTypes } from 'vue'
import { defineComponent } from 'vue'

export const checkboxProps = {
  checked: booleanType(),
  prefixCls: stringType('vc-checkbox'),
  'onUpdate:checked': eventType(),
  type: stringType('checkbox'),
  disabled: booleanType(),
}

export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>
const Checkbox = defineComponent({
  name: 'Checkbox',
  inheritAttrs: false,
  props: {
    ...checkboxProps,
  },
  setup(props, { attrs }) {
    return () => {
      const { prefixCls = 'vc-checkbox', checked, disabled, type = 'checkbox' } = props
      const { class: cls, style } = (attrs as any)
      const classString = classNames(
        prefixCls,
        cls,
        {
          [`${prefixCls}-checked`]: checked,
          [`${prefixCls}-disabled`]: disabled,
        },
      )
      return <span class={classString} style={style}>
          <input type={type} class={`${prefixCls}-input`} />

      </span>
    }
  },
})

export default Checkbox
