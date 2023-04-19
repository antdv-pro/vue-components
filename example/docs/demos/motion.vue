<script lang="ts" setup>
import { defineComponent, h, onBeforeUnmount, onMounted, reactive } from 'vue'
import CSSMotion from '../../../packages/motion/src'

const Div = defineComponent({
  setup(_, { attrs, slots }) {
    onMounted(() => {
      // eslint-disable-next-line no-console
      console.log('DIV >>> Mounted!')
    })

    onBeforeUnmount(() => {
      // eslint-disable-next-line no-console
      console.log('DIV >>> UnMounted!')
    })
    return () => {
      return h('div', attrs, slots)
    }
  },
})
const state = reactive({
  show: true,
  forceRender: false,
  motionLeaveImmediately: false,
  removeOnLeave: true,
  hasMotionClass: true,
  prepare: false,
})
const onTrigger = () => {
  setTimeout(() => {
    state.show = !state.show
  }, 100)
}
const onCollapse = () => {
  return { height: '0px' }
}
const skipColorTransition = (_: any, event: any) => {
  return event.propertyName !== 'background-color'
}
const styleGreen = () => {
  return { backgroundColor: 'green' }
}
const forceDelay = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 2000)
  })
}
const onVisibleChanged = (visible: boolean) => {
  // eslint-disable-next-line no-console
  console.log('Visible Changed:', visible)
}

const onMotionLeaveImmediately = () => {
  state.motionLeaveImmediately = !state.motionLeaveImmediately
}
</script>

<template>
  <label>
    <input type="checkbox" :checked="state.show" @change="onTrigger">
    Show Component
  </label>

  <label>
    <input v-model="state.hasMotionClass" type="checkbox">
    hasMotionClass
  </label>

  <label>
    <input v-model="state.forceRender" type="checkbox">
    forceRender
  </label>

  <label>
    <input v-model="state.removeOnLeave" type="checkbox">
    removeOnLeave {{ state.removeOnLeave ? '' : ' (use leavedClassName)' }}
  </label>

  <label>
    <input v-model="state.prepare" type="checkbox">
    prepare before motion
  </label>

  <div class="grid">
    <div>
      <h2>With Transition Class</h2>
      <!--      <CSSMotion -->
      <!--        :visible="state.show" -->
      <!--        :force-render="state.forceRender" -->
      <!--        :motion-name="state.hasMotionClass ? 'transition' : null" -->
      <!--        :remove-on-leave="state.removeOnLeave" -->
      <!--        leaved-class-name="hidden" -->
      <!--        @appear-prepare="state.prepare && forceDelay" -->
      <!--        @enter-prepare="state.prepare && forceDelay" -->
      <!--        @appear-start="onCollapse" -->
      <!--        @enter-start="onCollapse" -->
      <!--        @leave-active="onCollapse" -->
      <!--        @enter-end="skipColorTransition" -->
      <!--        @leave-end="skipColorTransition" -->
      <!--        @visible-changed="onVisibleChanged" -->
      <!--      > -->
      <!--        <Div v-show="state.show" class="demo-block" /> -->
      <!--      </CSSMotion> -->
      <Transition
        appear
        class="transition"
        enter-from-class="transition-appear"
        enter-to-class="transition-enter-active"
        leave-from-class="transition-leave"
        leave-to-class="transition-leave-active"
      >
        <Div v-show="state.show" class="demo-block" />
      </Transition>
    </div>

    <div>
      <h2>With Animation Class</h2>
      <Transition
        appear
        class="animation"
        enter-from-class="animation-appear animation-enter"
        enter-to-class="animation-appear-active animation-enter-active"
        leave-from-class="animation-leave"
        leave-to-class="animation-leave-active"
      >
        <Div v-if="state.show" class="demo-block" />
      </Transition>
      <!--          <CSSMotion -->
      <!--            :visible="state.show" -->
      <!--            :force-render="state.forceRender" -->
      <!--            :motion-name="state.hasMotionClass ? 'animation' : null" -->
      <!--            :remove-on-leave="state.removeOnLeave" -->
      <!--            leaved-class="hidden" -->
      <!--            @leave-active="styleGreen" -->
      <!--          > -->
      <!--            <template #default="props"> -->
      <!--              <div v-bind="props" class="demo-block" /> -->
      <!--            </template> -->
      <!--          </CSSMotion> -->
    </div>
  </div>

  <div>
    <button type="button" @click="onMotionLeaveImmediately">
      motionLeaveImmediately
    </button>

    <!--    <div> -->
    <!--      <CSSMotion -->
    <!--        v-if="state.motionLeaveImmediately" -->
    <!--        :visible="false" -->
    <!--        :motion-name="state.hasMotionClass ? 'transition' : null" -->
    <!--        :remove-on-leave="state.removeOnLeave" -->
    <!--        leaved-class="hidden" -->
    <!--        motion-leave-immediately -->
    <!--        @leave-active="onCollapse" -->
    <!--        @leave-end="skipColorTransition" -->
    <!--      > -->
    <!--        <template #default="props"> -->
    <!--          <div v-bind="props" class="demo-block" /> -->
    <!--        </template> -->
    <!--      </CSSMotion> -->
    <!--    </div> -->
  </div>
</template>

<style lang="less" scoped>
.grid {
    display: table;
    > div {
        display: table-cell;
    }
}

.demo-block {
    display: block;
    height: 200px;
    width: 50%;
    background: red;
    overflow: hidden;
}

.transition {
    transition: background 0.3s, height 1.3s, opacity 1.3s;
// transition: all 5s!important;

    &.transition-appear,
    &.transition-enter {
        opacity: 0;
        height: 0;
    }

    &.transition-appear.transition-appear-active,
    &.transition-enter.transition-enter-active {
        opacity: 1;
    }

    &.transition-leave-active {
        opacity: 0;
        height:0;
        background: green;
    }
}

.animation {
    animation-duration: 1.3s;
    animation-fill-mode: both;

    &.animation-appear,
    &.animation-enter {
        animation-name: enter;
        animation-fill-mode: both;
        animation-play-state: paused;
        opacity: 0;
        height: 0;
    }

    &.animation-appear.animation-appear-active,
    &.animation-enter.animation-enter-active {
        animation-name: enter;
        animation-play-state: running;
    }

    &.animation-leave {
        animation-name: leave;
        animation-fill-mode: both;
        animation-play-state: paused;

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
</style>
