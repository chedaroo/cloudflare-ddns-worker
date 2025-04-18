import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'lcov', 'html'],
			exclude: [
				'scripts/**',
				'test/**', // ✅ optional: ignore tests themselves
				'**/*.test.*', // ✅ optional: ignore test files
				'vitest.config.*', // ✅ optional: ignore config
			],
		},
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
		reporters: process.env.GITHUB_ACTIONS ? ['default', 'github-actions'] : ['default'],
	},
});
