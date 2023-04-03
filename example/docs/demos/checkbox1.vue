<script lang="ts" setup>
import Checkbox from '@v-c/checkbox'
import { ref } from 'vue'
const checked = ref(false)
</script>

<template>
  <div>
    <div>
      <Checkbox v-model:value="checked" /> 测试选中：{{ checked }}
    </div>
  </div>
</template>
