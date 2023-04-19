import { defineComponent } from 'vue'

const DomWrapper = defineComponent({
  name: 'DomWrapper',
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

export default DomWrapper
