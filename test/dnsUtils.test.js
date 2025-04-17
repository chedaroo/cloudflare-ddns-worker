import { describe, it, expect } from 'vitest';
import { mergeRecord, recordsAreEqual } from '../src/utils/dns.js';

describe('mergeRecord', () => {
	it('respects overrides', () => {
		const merged = mergeRecord(null, 'home.example.com', '1.2.3.4', {
			type: 'AAAA',
			ttl: 600,
			proxied: false,
		});

		expect(merged).toEqual({
			type: 'AAAA',
			name: 'home.example.com',
			content: '1.2.3.4',
			ttl: 600,
			proxied: false,
		});
	});

	it('preserves existing values if not overridden', () => {
		const existing = {
			type: 'A',
			ttl: 120,
			proxied: true,
		};
		const merged = mergeRecord(existing, 'home.example.com', '1.2.3.4', {});
		expect(merged.type).toBe('A');
		expect(merged.ttl).toBe(120);
		expect(merged.proxied).toBe(true);
	});
});

describe('recordsAreEqual', () => {
	it('returns true if records match', () => {
		const existing = {
			type: 'A',
			content: '1.2.3.4',
			ttl: 120,
			proxied: true,
		};
		const current = { ...existing, name: 'home.example.com' };
		expect(recordsAreEqual(existing, current)).toBe(true);
	});

	it('returns false if any field differs', () => {
		const base = {
			type: 'A',
			content: '1.2.3.4',
			ttl: 120,
			proxied: true,
		};
		expect(recordsAreEqual(base, { ...base, ttl: 300 })).toBe(false);
		expect(recordsAreEqual(base, { ...base, content: '5.6.7.8' })).toBe(false);
		expect(recordsAreEqual(null, base)).toBe(false);
	});
});
