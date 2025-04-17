import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getZoneId, getDnsRecord, updateDnsRecord, createDnsRecord } from '../src/utils/cloudflare.js';

global.fetch = vi.fn();

describe('Cloudflare API helpers', () => {
	beforeEach(() => {
		fetch.mockReset();
	});

	it('gets zone ID', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ result: [{ id: 'zone123' }] }),
		});

		const zoneId = await getZoneId('example.com', 'TOKEN');
		expect(zoneId).toBe('zone123');
	});

	it('gets DNS record', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ result: [{ id: 'record123', name: 'home.example.com' }] }),
		});

		const record = await getDnsRecord('zone123', 'home.example.com', 'TOKEN');
		expect(record.name).toBe('home.example.com');
	});

	it('updates a DNS record', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true, result: { id: 'record123' } }),
		});

		const result = await updateDnsRecord(
			'zone123',
			'record123',
			{
				type: 'A',
				name: 'home.example.com',
				content: '1.2.3.4',
				ttl: 1,
				proxied: true,
			},
			'TOKEN'
		);

		expect(result.success).toBe(true);
	});

	it('creates a DNS record', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true, result: { id: 'new-record' } }),
		});

		const result = await createDnsRecord(
			'zone123',
			{
				type: 'A',
				name: 'home.example.com',
				content: '1.2.3.4',
				ttl: 1,
				proxied: true,
			},
			'TOKEN'
		);

		expect(result.result.id).toBe('new-record');
	});
});
