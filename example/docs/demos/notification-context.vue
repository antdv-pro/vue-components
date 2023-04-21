<script lang="ts" setup>
import { h } from 'vue'
import { useNotification } from '../../../packages/notification/src'
import motion from './motion'
const NOTICE = {
  content: h('span', ['simple show']),
  onClose() {
    console.log('simple close')
  },
  // duration: null,
}
const [api, Holder] = useNotification({ motion })
console.log(Holder)
const onHandleClick = () => {
  (api as any).open({
    ...NOTICE,
    content: 'Hi there!',
    props: {
      'data-test-id': 'my-test-id',
    },
  })
}
</script>

<template>
  <div>
    <button
      type="button"
      @click="onHandleClick"
    >
      simple show
    </button>
    <!---->
    <Holder />
  </div>
</template>

<style scoped>

</style>
