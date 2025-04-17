import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRequest } from '../src/handler.js';

global.fetch = vi.fn();

function makeAuthedRequest(query, username = 'user', password = 'pass') {
	const creds = btoa(`${username}:${password}`);
	const headers = new Headers({
		Authorization: `Basic ${creds}`,
	});
	return new Request(`https://example.com/update?${query}`, { headers });
}

const env = {
	BASIC_AUTH_USER: 'user',
	BASIC_AUTH_PASS: 'pass',
	CLOUDFLARE_API_TOKEN: 'test-token',
};

describe('handleRequest', () => {
	beforeEach(() => {
		fetch.mockReset();
	});

	it('creates a new record if none exists', async () => {
		// 1st fetch: getZoneId
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ result: [{ id: 'zone123' }] }),
		});

		// 2nd fetch: getDnsRecord (returns no record)
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ result: [] }),
		});

		// 3rd fetch: createDnsRecord
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ result: { id: 'created', name: 'home.example.com' } }),
		});

		const req = makeAuthedRequest('hostname=home.example.com&ip=1.2.3.4');
		const res = await handleRequest(req, env);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.result.name).toBe('home.example.com');
	});

	it('updates an existing record with new IP', async () => {
		fetch
			// getZoneId
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: [{ id: 'zone123' }] }),
			})
			// getDnsRecord
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					result: [
						{
							id: 'record123',
							name: 'home.example.com',
							type: 'A',
							content: '5.5.5.5',
							ttl: 1,
							proxied: true,
						},
					],
				}),
			})
			// updateDnsRecord
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: { id: 'record123', content: '1.2.3.4' } }),
			});

		const req = makeAuthedRequest('hostname=home.example.com&ip=1.2.3.4');
		const res = await handleRequest(req, env);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.result.content).toBe('1.2.3.4');
	});

	it('returns 200 if nothing changes', async () => {
		fetch
			// getZoneId
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: [{ id: 'zone123' }] }),
			})
			// getDnsRecord
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					result: [
						{
							id: 'record123',
							name: 'home.example.com',
							type: 'A',
							content: '1.2.3.4',
							ttl: 1,
							proxied: true,
						},
					],
				}),
			});

		const req = makeAuthedRequest('hostname=home.example.com&ip=1.2.3.4');
		const res = await handleRequest(req, env);
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toBe('Record unchanged');
	});

	it('handles missing query params', async () => {
		const req = makeAuthedRequest('hostname=missing.com');
		const res = await handleRequest(req, env);
		expect(res.status).toBe(500);
		const body = await res.text();
		expect(body).toMatch(/Missing hostname or ip/);
	});
});
