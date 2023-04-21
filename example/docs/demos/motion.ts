import type { CSSMotionProps } from '@v-c/utils'

const motion: CSSMotionProps = {
  motionName: 'vc-notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  onLeaveStart: (ele: any) => {
    const { offsetHeight } = ele
    return { height: offsetHeight }
  },
  onLeaveActive: () => {
    return { height: 0, opacity: 0, margin: 0 }
  },
}

export default motion
