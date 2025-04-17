import { describe, it, expect } from 'vitest';
import { responseJSON, responseError } from '../src/utils/response.js';

describe('response helpers', () => {
	it('returns JSON response', async () => {
		const res = responseJSON({ success: true });
		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toMatch(/json/);
		const body = await res.text();
		expect(body).toContain('"success": true');
	});

	it('returns error response', async () => {
		const res = responseError('Something went wrong', 500);
		expect(res.status).toBe(500);
		const text = await res.text();
		expect(text).toBe('Something went wrong');
	});
});
