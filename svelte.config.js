import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function isWebComponentSvelte(code) {
  const svelteOptionsIdx = code.indexOf('<svelte:options ')
  if(svelteOptionsIdx < 0) {
      return false
  }
  const tagOptionIdx = code.indexOf('tag:', svelteOptionsIdx)
  const svelteOptionsEndIdx = code.indexOf('>',svelteOptionsIdx);
  return tagOptionIdx > svelteOptionsIdx && tagOptionIdx < svelteOptionsEndIdx;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
  vitePlugin: {
    dynamicCompileOptions({code}) {
      if (isWebComponentSvelte(code)) {
          return {
              customElement: true,
          }
      }
    }
  },
	kit: {
		adapter: adapter()
	},
};

export default config;
