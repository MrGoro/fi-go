import {
  defineConfig,
  minimal2023Preset,
  createAppleSplashScreens,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: {
        background: '#E5173F',
        fit: 'contain',
      },
      darkResizeOptions: {
        background: '#E5173F',
        fit: 'contain',
      },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        xhtml: false,
      },
      name: (landscape, size, dark) =>
        `apple-splash-${landscape ? 'landscape' : 'portrait'}-${dark ? 'dark-' : ''}${size.width}x${size.height}.png`,
    }),
  },
  images: ['public/icon-512.svg'],
})
