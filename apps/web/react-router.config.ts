import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/dev';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Disable prerendering for faster builds - pages render on-demand
	prerender: false,
	presets: [vercelPreset()],
} satisfies Config;
