import { defineComponent } from 'vue'

const DomWrapper = defineComponent({
  name: 'DomWrapper',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

export default DomWrapper
