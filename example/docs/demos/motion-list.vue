<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue'
import { CSSMotionList } from '../../../packages/motion/src'
interface DemoState {
  count: number
  checkedMap: Record<string, boolean>
  keyList: any[]
}
const state = reactive<DemoState>({
  count: 1,
  checkedMap: {},
  keyList: [],
})

const onCountChange = (info: any) => {
  const { value } = info.target
  state.count = Number(value)
}

const onFlushMotion = () => {
  const { count, checkedMap } = state
  let keyList = []
  for (let i = 0; i < count; i += 1) {
    if (checkedMap[i] !== false)
      keyList.push(i)
  }

  keyList = keyList.map((key) => {
    if (key === 3)
      return { key, background: 'orange' }

    return key
  })

  state.keyList = keyList
}
const onCollapse = () => ({ width: 0, margin: '0 -5px 0 0' })
const counterArr = computed(() => new Array(state.count).fill(undefined))
const onCheckboxChange = (key: any, checked: any) => {
  state.checkedMap = {
    ...state.checkedMap,
    [key]: !checked,
  }
}
onMounted(() => {
  onFlushMotion()
})
const onVisibleChanged = (changedVisible: any, info: any) => {
  // eslint-disable-next-line no-console
  console.log('Visible Changed >>>', changedVisible, info)
}
</script>

<template>
  <div>
    key 3 is a different component with others.
    <!---->
    <div>
      <label>
        node count
        <input
          type="number"
          :min="0"
          :value="state.count"
          @change="onCountChange"
        >
      </label>
      <button type="button" @click="onFlushMotion">
        Flush Motion
      </button>
    </div>
    <div>
      <template v-for="(_, key) in counterArr" :key="key">
        <label>
          <input
            type="checkbox"
            :checked="state.checkedMap[key] !== false"
            @change="onCheckboxChange(key, state.checkedMap[key] !== false)"
          >
          {{ key }}
        </label>
      </template>
    </div>
    <div>
      <CSSMotionList
        :keys="state.keyList"
        motion-name="transition"
        @appear-start="onCollapse"
        @enter-start="onCollapse"
        @leave-active="onCollapse"
        @visible-changed="onVisibleChanged"
      >
        <template #default="props">
          <div
            class="list-demo-block"
            :class="props.class"
            :style="{ ...props?.style, background: props?.background }"
          >
            <span>{{ props.key }}</span>
          </div>
        </template>
      </CSSMotionList>
    </div>
  </div>
</template>

<style lang="less" scoped>
.grid {
    display: table;

    > div {
        display: table-cell;
        min-width: 350px;
    }
}

.demo-block {
    display: block;
    width: 300px;
    height: 300px;
    overflow: hidden;
    background: red;
}

.transition {
    transition: background 0.3s, height 1.3s, opacity 1.3s;
// transition: all 5s!important;

    &.transition-appear,
    &.transition-enter {
        opacity: 0;
    }

    &.transition-appear.transition-appear-active,
    &.transition-enter.transition-enter-active {
        opacity: 1;
    }

    &.transition-leave-active {
        background: green;
        opacity: 0;
    }
}

.animation {
    animation-duration: 1.3s;
    animation-fill-mode: both;

    &.animation-appear,
    &.animation-enter {
        animation-name: enter;
        animation-play-state: paused;
        animation-fill-mode: both;
    }

    &.animation-appear.animation-appear-active,
    &.animation-enter.animation-enter-active {
        animation-name: enter;
        animation-play-state: running;
    }

    &.animation-leave {
        animation-name: leave;
        animation-play-state: paused;
        animation-fill-mode: both;

        &.animation-leave-active {
            animation-name: leave;
            animation-play-state: running;
        }
    }
}

.hidden {
    display: none !important;
}

@keyframes enter {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes leave {
    from {
        transform: scale(1);
        opacity: 1;
    }
    to {
        transform: scale(0);
        opacity: 0;
    }
}

.list-demo-block {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    background: red;
    border-right: 5px solid #fff;

    > span {
        position: absolute;
        top: 50%;
        left: 50%;
        color: #fff;
        font-size: 30px;
        transform: translate(-50%, -50%);
    }
}

.transition {
    transition: all 0.5s;
}
</style>
