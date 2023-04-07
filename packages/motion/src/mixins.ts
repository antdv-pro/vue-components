import type { ComponentPublicInstance } from 'vue'

function getComponentStaticMethod<T = Function>(
  instance: ComponentPublicInstance,
  methodName: string,
): T | undefined {
  return (instance as any).$.type[methodName]
}

export const DerivedStateFromPropsMixin = {
  created() {
    const getDerivedStateFromProps = getComponentStaticMethod(
      // @ts-expect-error this is a vue internal property
      this,
      'getDerivedStateFromProps',
    );

    (this as any).prevState = { ...(this as any).state }

    Object.assign(
      (this as any).state,
      // @ts-expect-error this is a vue internal property
      getDerivedStateFromProps.call(this, (this as any).$props, (this as any).prevState),
    )
  },

  beforeUpdate() {
    const getDerivedStateFromProps = getComponentStaticMethod(
      // @ts-expect-error this is a vue internal property
      this,
      'getDerivedStateFromProps',
    );

    (this as any).prevState = { ...(this as any).state }

    Object.assign(
      (this as any).state,
      // @ts-expect-error this is a vue internal property
      getDerivedStateFromProps.call(this, this.$props, this.prevState),
    )
  },
}
