import type { VueKey } from '@v-c/utils'
import { arrayType, eventType, isString, someType } from '@v-c/utils'
import type { ExtractPropTypes } from 'vue'
import { Fragment, defineComponent, h, onBeforeUpdate, reactive } from 'vue'
import OriginCSSMotion, { cssMotionProps } from './css-motion'
import type { CSSMotionProps } from './css-motion'
import { supportTransition } from './util/motion'
import {
  STATUS_ADD,
  STATUS_KEEP,
  STATUS_REMOVE,
  STATUS_REMOVED,
  diffKeys,
  parseKeys,
} from './util/diff'
import type { KeyObject } from './util/diff'

const MOTION_PROP_NAMES = [
  'eventProps',
  'visible',
  'children',
  'motionName',
  'motionAppear',
  'motionEnter',
  'motionLeave',
  'motionLeaveImmediately',
  'motionDeadline',
  'removeOnLeave',
  'leavedClassName',
  'onAppearStart',
  'onAppearActive',
  'onAppearEnd',
  'onEnterStart',
  'onEnterActive',
  'onEnterEnd',
  'onLeaveStart',
  'onLeaveActive',
  'onLeaveEnd',
]

export const cssMotionListProps = {
  ...cssMotionProps,
  keys: arrayType<(VueKey | { key: VueKey;[name: string]: any })[]>(),
  component: someType<string>([String, Object, Boolean]),
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged: eventType<(visible: boolean, info: { key: VueKey }) => void>(),
  /** All motion leaves in the screen */
  onAllRemoved: eventType<() => void>(),
}

export type CSSMotionListProps = Partial<ExtractPropTypes<typeof cssMotionListProps>>

export interface CSSMotionListState {
  keyEntities: KeyObject[]
}

/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
function genCSSMotionList(transitionSupport: boolean, CSSMotion = OriginCSSMotion) {
  return defineComponent({
    name: 'CSSMotionList',
    inheritAttrs: false,
    props: cssMotionListProps,
    setup(props, { slots, attrs }) {
      const state = reactive<CSSMotionListState>({
        keyEntities: [],
      })

      const getDerivedStateFromProps = ({ keys }: CSSMotionListProps,
        { keyEntities }: CSSMotionListState) => {
        // TODO
        const parsedKeyObject = parseKeys(keys)
        const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObject)
        return {
          keyEntities: mixedKeyEntities.filter((entity) => {
            const prevEntity = keyEntities.find(({ key }) => key === entity.key)

            // Remove if already mark as removed
            if (prevEntity
                && prevEntity.status === STATUS_REMOVED
                && entity.status === STATUS_REMOVE
            )
              return false

            return true
          }),
        }
      }
      state.keyEntities = getDerivedStateFromProps(props, state).keyEntities
      onBeforeUpdate(() => {
        state.keyEntities = getDerivedStateFromProps(props, state).keyEntities
      })

      const removeKey = (removeKey: VueKey) => {
        const keyEntities = state.keyEntities
        const nextKeyEntities = keyEntities.map((entity) => {
          if (entity.key !== removeKey) return entity
          return {
            ...entity,
            status: STATUS_REMOVED,
          }
        })
        state.keyEntities = nextKeyEntities
        return nextKeyEntities.filter(({ status }) => status !== STATUS_REMOVED).length
      }
      const Component = defineComponent({
        name: 'CSSMotionList1',
        inheritAttrs: false,
        setup(_, { slots, attrs }) {
          const component = props?.component
          return () => {
            if (isString(component)) return h(component, [slots.default?.()])
            if (component) return h(component, { ...attrs }, slots.default?.())
            return slots.default?.()
          }
        },
      })

      return () => {
        const keyEntities = state.keyEntities
        const { onVisibleChanged, onAllRemoved, ...restProps } = props
        delete (restProps as any).component
        const motionProps: CSSMotionProps = {}
        MOTION_PROP_NAMES.forEach((prop) => {
          (motionProps as any)[prop] = (restProps as any)[prop]
          delete (restProps as any)[prop]
        })
        delete (restProps as any).keys
        const cssMotionSlots = {
          default: (props: any) => {
            return slots.default?.(props)
          },
        }
        return (
            <Component {...restProps}>
                {keyEntities.map(({ status, ...eventProps }) => {
                  const visible = status === STATUS_ADD || status === STATUS_KEEP
                  return (
                      <CSSMotion
                          {...motionProps}
                          key={eventProps.key}
                          visible={visible as any}
                          eventProps={{ ...eventProps, ...attrs }}
                          onVisibleChanged={(changedVisible) => {
                            onVisibleChanged?.(changedVisible, { key: eventProps.key })
                            if (!changedVisible) {
                              const restKeysCount = removeKey(eventProps.key)
                              if (restKeysCount === 0 && onAllRemoved)
                                onAllRemoved()
                            }
                          }}
                          v-slots={cssMotionSlots}
                      />
                  )
                })}
            </Component>
        )
      }
    },
  })
}

export default genCSSMotionList(supportTransition)
