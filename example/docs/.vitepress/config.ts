import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Demos',
  description: 'A VitePress Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/components' },
    ],

    sidebar: [
      {
        text: 'Components',
        items: [
          { text: 'Checkbox', link: '/checkbox' },
          { text: 'Notification', link: '/notification' },
          { text: 'Motion', link: '/motion' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
})
