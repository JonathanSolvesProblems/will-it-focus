import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'qnl9jh8n',
    dataset: 'production'
  },
  studioHost: 'will-it-focus',
  deployment: {
    appId: 'yxv9zmufsecznkxc2fcjtb8p',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
