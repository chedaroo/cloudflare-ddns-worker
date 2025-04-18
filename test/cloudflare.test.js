import { getZoneId, getDnsRecord, updateDnsRecord, createDnsRecord } from '../src/utils/cloudflare.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

const token = 'fake-token';

describe('cloudflare.js', () => {
	beforeEach(() => {
		fetch.mockReset();
	});

	describe('getZoneId', () => {
		it('returns zone ID when zone is found', async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: [{ id: 'zone123' }] }),
			});

			const id = await getZoneId('example.com', token);
			expect(id).toBe('zone123');
		});

		it('returns null when no zone is found', async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: [] }),
			});

			const id = await getZoneId('example.com', token);
			expect(id).toBeNull();
		});

		it('throws on API error', async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ errors: [{ message: 'API fail' }] }),
			});

			await expect(getZoneId('example.com', token)).rejects.toThrow('API fail');
		});
	});

	describe('getDnsRecord', () => {
		it('returns record if found', async () => {
			const record = { id: 'rec123', content: '1.2.3.4' };

			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: [record] }),
			});

			const result = await getDnsRecord('zone123', 'home.example.com', token);
			expect(result).toEqual(record);
		});

		it('returns null if no record is found', async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: [] }),
			});

			const result = await getDnsRecord('zone123', 'home.example.com', token);
			expect(result).toBeNull();
		});

		it('throws on API error', async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ errors: [{ message: 'Record fetch failed' }] }),
			});

			await expect(getDnsRecord('zone123', 'host', token)).rejects.toThrow('Record fetch failed');
		});
	});

	describe('updateDnsRecord', () => {
		it('sends PUT request with body', async () => {
			const record = { content: '1.2.3.4' };

			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: { id: 'updated' } }),
			});

			const res = await updateDnsRecord('zone123', 'rec123', record, token);
			expect(res.result.id).toBe('updated');
			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining('/zones/zone123/dns_records/rec123'),
				expect.objectContaining({ method: 'PUT' })
			);
		});
	});

	describe('createDnsRecord', () => {
		it('sends POST request with body', async () => {
			const record = { content: '1.2.3.4' };

			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ result: { id: 'created' } }),
			});

			const res = await createDnsRecord('zone123', record, token);
			expect(res.result.id).toBe('created');
			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining('/zones/zone123/dns_records'),
				expect.objectContaining({ method: 'POST' })
			);
		});
	});

	describe('cfApi', () => {
		it('throws generic error if no error message returned', async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ errors: [] }),
			});

			await expect(
				getZoneId('example.com', token) // triggers cfApi internally
			).rejects.toThrow('Cloudflare API error');
		});
	});
});
