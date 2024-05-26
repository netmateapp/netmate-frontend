import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import reloadSettings from './vite-plugins/reloadSettings';

export default defineConfig({
	plugins: [sveltekit(), reloadSettings()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
