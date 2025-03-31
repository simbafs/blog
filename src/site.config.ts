import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  // === Basic configuration ===
  /** Title for your website. Will be used in metadata and as browser tab title. */
  title: '長條貓窩',
  /** Will be used in index page & copyright declaration */
  author: 'Simba Fs',
  /** Description metadata for your website. Can be used in page metadata. */
  description: '我家貓貓叫花生',
  /** The default favicon for your site which should be a path to an image in the `public/` directory. */
  favicon: '/favicon/favicon.ico',
  /** Specify the default language for this site. */
  locale: {
    lang: 'en-US',
    attrs: 'en_US',
    // Date locale
    dateLocale: 'en-US',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  /** Set a logo image to show in the homepage. */
  logo: {
    src: 'src/assets/avatar.png',
    alt: 'Avatar'
  },

  // === Global configuration ===
  titleDelimiter: '•',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  // in test
  head: [
    /* Telegram channel */
    // {
    //   tag: 'meta',
    //   attrs: { name: 'telegram:channel', content: '@cworld0_cn' },
    //   content: ''
    // }
  ],
  customCss: [],

  /** Configure the header of your site. */
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      // { title: 'Docs', link: '/docs/list' },
      { title: 'Projects', link: '/projects' },
      // { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ]
  },

  /** Configure the footer of your site. */
  footer: {
    /** Enable displaying a “Astro & Pure theme powered” link in your site’s footer. */
    credits: true,
    /** Optional details about the social media accounts for this site. */
    social: {
      github: 'https://astro.build/chat',
      x: 'https://x.com/simbafs',
      telegram: 'https://t.me/simbafs'
    }
  },

  content: {
    externalLinksContent: ' ↗',
    /** Blog page size for pagination (optional) */
    blogPageSize: 8,
    externalLinkArrow: true, // show external link arrow
    // Currently support weibo, x, bluesky
    share: ['x', 'bluesky']
  }
}

export const integ: IntegrationUserConfig = {
  links: {
    logbook: [
      { date: '2024-07-01', content: 'Lorem ipsum dolor sit amet.' },
      { date: '2024-07-01', content: 'vidit suscipit at mei.' },
      { date: '2024-07-01', content: 'Quem denique mea id.' }
    ],
    // Yourself link info
    applyTip: {
      name: theme.title,
      desc: theme.description || 'Null',
      url: 'https://astro-pure.js.org',
      avatar: 'https://astro-pure.js.org/favicon/favicon.ico'
    }
  },
  // Enable page search function
  pagefind: true,
  // Add a random quote to the footer (default on homepage footer)
  // quote: {
  //   // https://developer.hitokoto.cn/sentence/#%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80
  //   // server: 'https://v1.hitokoto.cn/?c=i',
  //   // target: (data) => (data as { hitokoto: string }).hitokoto || 'Error'
  //   // https://github.com/lukePeavey/quotable
  //   server: 'https://api.quotable.io/quotes/random?maxLength=60',
  //   target: `(data) => data[0].content || 'Error'`
  // },
  // Tailwindcss typography
  typography: {
    // https://github.com/tailwindlabs/tailwindcss-typography
    class:
      'break-words prose prose-pure dark:prose-invert dark:prose-pure prose-headings:font-medium'
  },
  // A lightbox library that can add zoom effect
  mediumZoom: {
    enable: true, // disable it will not load the whole library
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  }
  // Comment system
  // waline: {
  //   enable: true,
  //   // Server service link
  //   server: 'https://astro-theme-pure-waline.arthals.ink/',
  //   // Refer https://waline.js.org/en/guide/features/emoji.html
  //   emoji: ['bmoji', 'weibo'],
  //   // Refer https://waline.js.org/en/reference/client/props.html
  //   additionalConfigs: {
  //     // search: false,
  //     pageview: true,
  //     comment: true,
  //     locale: {
  //       reaction0: 'Like',
  //       placeholder: 'Welcome to comment. (Email to receive replies. Login is unnecessary)'
  //     },
  //     imageUploader: false
  //   }
  // }
}

// export const terms: CardListData = {
//   title: 'Terms content',
//   list: [
//     {
//       title: 'Privacy Policy',
//       link: '/terms/privacy-policy'
//     },
//     {
//       title: 'Terms and Conditions',
//       link: '/terms/terms-and-conditions'
//     },
//     {
//       title: 'Copyright',
//       link: '/terms/copyright'
//     },
//     {
//       title: 'Disclaimer',
//       link: '/terms/disclaimer'
//     }
//   ]
// }

const config = { ...theme, integ } as Config
export default config
