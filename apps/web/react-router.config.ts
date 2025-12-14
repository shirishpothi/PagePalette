import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Disable prerendering for faster builds - pages render on-demand
	prerender: false,
} satisfies Config;
