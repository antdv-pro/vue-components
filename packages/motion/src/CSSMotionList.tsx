import type { VueKey } from '@v-c/utils'
import { anyType, arrayType } from '@v-c/utils'
import { Fragment, defineComponent } from 'vue'

import type { CSSMotionProps } from './CSSMotion'
import OriginCSSMotion, {
  getCSSMotionPropTypes,
} from './CSSMotion'
import { DerivedStateFromPropsMixin } from './mixins'

import type { KeyObject } from './util/diff'
import {
  STATUS_ADD,
  STATUS_KEEP,
  STATUS_REMOVE,
  STATUS_REMOVED,
  diffKeys,
  parseKeys,
} from './util/diff'

import { supportTransition } from './util/motion'

export interface CSSMotionListProps
  extends Omit<CSSMotionProps, 'onVisibleChanged'> {
  keys: (VueKey | { key: VueKey; [name: string]: any })[]
  component?: string | object | false
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean, info: { key: VueKey }) => void
}

export interface CSSMotionListState {
  keyEntities: KeyObject[]
}

/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
export function genCSSMotionList(
  transitionSupport: boolean,
  CSSMotion = OriginCSSMotion,
) {
  return defineComponent<CSSMotionListProps, {}, { state: CSSMotionListState }>(
    {
      name: 'CSSMotionList',
      mixins: [DerivedStateFromPropsMixin],

      props: {
        ...getCSSMotionPropTypes(),

        keys: arrayType(),

        component: anyType(),
      } as any,

      data() {
        return {
          state: {
            keyEntities: [],
          },
        }
      },

      getDerivedStateFromProps(
        { keys }: CSSMotionListProps,
        { keyEntities }: CSSMotionListState,
      ) {
        const parsedKeyObjects = parseKeys(keys as any)
        const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects)

        return {
          keyEntities: mixedKeyEntities.filter((entity) => {
            const prevEntity = keyEntities.find(
              ({ key }) => entity.key === key,
            )

            // Remove if already mark as removed
            return !(
              prevEntity
              && prevEntity.status === STATUS_REMOVED
              && entity.status === STATUS_REMOVE
            )
          }),
        }
      },

      methods: {
        removeKey(removeKey: VueKey) {
          this.state.keyEntities = this.state.keyEntities.map((entity) => {
            if (entity.key !== removeKey) return entity

            return {
              ...entity,
              status: STATUS_REMOVED,
            }
          })
        },
      },

      render() {
        const {
          component,
          onVisibleChanged,
          ...motionProps
        }: CSSMotionListProps = this.$props

        const Component = component || Fragment
        const { keyEntities }: CSSMotionListState = this.state

        return (
          // @ts-expect-error this is a Vue 3 feature
          <Component {...{ ...this.$attrs }}>
            {keyEntities.map(({ status, ...eventProps }) => {
              const visible = status === STATUS_ADD || status === STATUS_KEEP

              return (
                <CSSMotion
                  {...motionProps}
                  key={eventProps.key}
                  visible={visible}
                  eventProps={eventProps}
                  onVisibleChanged={(changedVisible) => {
                    onVisibleChanged?.(changedVisible, { key: eventProps.key })

                    if (!changedVisible) {
                      // @ts-expect-error this is a Vue 3 feature
                      this.removeKey(eventProps.key)
                    }
                  }}
                  v-slots={this.$slots}
                />
              )
            })}
          </Component>
        )
      },
    },
  )
}

export default genCSSMotionList(supportTransition)
