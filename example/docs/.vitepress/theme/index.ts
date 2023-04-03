// eslint-disable-next-line import/no-named-as-default
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { AntdTheme } from 'vite-plugin-vitepress-demo/theme'
import "../assets/index.less"
export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('demo', AntdTheme)
  },
} as Theme
