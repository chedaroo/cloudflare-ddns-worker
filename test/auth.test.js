import { validateBasicAuth, unauthorizedResponse } from '../src/utils/auth.js';
import { describe, it, expect } from 'vitest';

function createRequestWithAuth(username, password) {
	const creds = btoa(`${username}:${password}`);
	const headers = new Headers({
		Authorization: `Basic ${creds}`,
	});
	return new Request('https://example.com', { headers });
}

describe('validateBasicAuth', () => {
	const env = {
		BASIC_AUTH_USER: 'user',
		BASIC_AUTH_PASS: 'pass',
	};

	it('returns true for correct credentials', () => {
		const req = createRequestWithAuth('user', 'pass');
		expect(validateBasicAuth(req, env)).toBe(true);
	});

	it('returns false for incorrect username', () => {
		const req = createRequestWithAuth('wrong', 'pass');
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false for incorrect password', () => {
		const req = createRequestWithAuth('user', 'wrong');
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false when Authorization header is missing', () => {
		const req = new Request('https://example.com');
		expect(validateBasicAuth(req, env)).toBe(false);
	});
});

describe('unauthorizedResponse', () => {
	it('returns a 401 response with WWW-Authenticate header', async () => {
		const res = unauthorizedResponse();
		expect(res.status).toBe(401);
		expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="Cloudflare DDNS Worker"');
		const body = await res.text();
		expect(body).toBe('Unauthorized');
	});
});
