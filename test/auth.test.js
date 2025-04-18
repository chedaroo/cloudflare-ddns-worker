import { describe, it, expect } from 'vitest';
import { validateBasicAuth, unauthorizedResponse } from '../src/utils/auth.js';

function createRequestWithAuthHeader(headerValue) {
	return new Request('https://example.com', {
		headers: {
			Authorization: headerValue,
		},
	});
}

describe('validateBasicAuth', () => {
	const env = {
		BASIC_AUTH_USER: 'user',
		BASIC_AUTH_PASS: 'pass',
	};

	it('returns true for correct credentials', () => {
		const creds = btoa('user:pass');
		const req = createRequestWithAuthHeader(`Basic ${creds}`);
		expect(validateBasicAuth(req, env)).toBe(true);
	});

	it('returns false for incorrect username', () => {
		const creds = btoa('wrong:pass');
		const req = createRequestWithAuthHeader(`Basic ${creds}`);
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false for incorrect password', () => {
		const creds = btoa('user:wrong');
		const req = createRequestWithAuthHeader(`Basic ${creds}`);
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false when Authorization header is missing', () => {
		const req = new Request('https://example.com');
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false when Authorization header is not Basic', () => {
		const req = createRequestWithAuthHeader('Bearer sometoken');
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false for malformed base64 string', () => {
		const req = createRequestWithAuthHeader('Basic not-base64-@@@');
		expect(validateBasicAuth(req, env)).toBe(false);
	});

	it('returns false if base64 decodes but has wrong format (no colon)', () => {
		const creds = btoa('userpass'); // no colon
		const req = createRequestWithAuthHeader(`Basic ${creds}`);
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
