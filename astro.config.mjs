// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://chazinlab.github.io',

  // Writes sitemap-index.xml at build time so search engines can find every page.
  integrations: [sitemap()],

  fonts: [
    {
      // Montserrat is a free stand-in for Proxima Nova.
      // To switch once the lab has an Adobe Fonts kit, replace these two lines with:
      //   provider: fontProviders.adobe({ id: 'YOUR_KIT_ID' }),
      //   name: 'proxima-nova',
      provider: fontProviders.fontsource(),
      name: 'Montserrat',
      cssVariable: '--font-sans',
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      fallbacks: ['sans-serif'],
    },
  ],
});
