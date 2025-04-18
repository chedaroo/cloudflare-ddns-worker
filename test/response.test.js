import { describe, it, expect } from 'vitest';
import { responseJSON, responseError } from '../src/utils/response.js';

describe('responseJSON', () => {
	it('returns a 200 JSON response', async () => {
		const data = { message: 'Hello', count: 2 };
		const res = responseJSON(data);

		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toBe('application/json');

		const body = await res.text();
		expect(JSON.parse(body)).toEqual(data);
	});
});

describe('responseError', () => {
	it('returns a 500 error by default', async () => {
		const res = responseError('Something went wrong');

		expect(res.status).toBe(500);
		const body = await res.text();
		expect(body).toBe('Something went wrong');
	});

	it('returns custom status code if provided', async () => {
		const res = responseError('Bad request', 400);

		expect(res.status).toBe(400);
		const body = await res.text();
		expect(body).toBe('Bad request');
	});
});
