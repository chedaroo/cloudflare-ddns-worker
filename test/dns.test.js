import { describe, it, expect } from 'vitest';
import { extractRootDomain, mergeRecord, recordsAreEqual } from '../src/utils/dns.js';

describe('extractRootDomain', () => {
	it('returns root domain from full hostname', () => {
		expect(extractRootDomain('home.example.com')).toBe('example.com');
		expect(extractRootDomain('api.v1.dev.net')).toBe('dev.net');
		expect(extractRootDomain('example.com')).toBe('example.com');
	});
});

describe('mergeRecord', () => {
	it('merges with full overrides', () => {
		const existing = {
			type: 'A',
			ttl: 1,
			proxied: false,
		};

		const merged = mergeRecord(existing, 'home.example.com', '1.2.3.4', { type: 'AAAA', ttl: 300, proxied: true });

		expect(merged).toEqual({
			type: 'AAAA',
			name: 'home.example.com',
			content: '1.2.3.4',
			ttl: 300,
			proxied: true,
		});
	});

	it('falls back to existing values if override missing', () => {
		const existing = {
			type: 'A',
			ttl: 120,
			proxied: false,
		};

		const merged = mergeRecord(existing, 'home.example.com', '1.2.3.4', {});
		expect(merged).toEqual({
			type: 'A',
			name: 'home.example.com',
			content: '1.2.3.4',
			ttl: 120,
			proxied: false,
		});
	});

	it('uses defaults when existing is null', () => {
		const merged = mergeRecord(null, 'home.example.com', '1.2.3.4', {});
		expect(merged).toEqual({
			type: 'A',
			name: 'home.example.com',
			content: '1.2.3.4',
			ttl: 1,
			proxied: true,
		});
	});
});

describe('recordsAreEqual', () => {
	const base = {
		type: 'A',
		content: '1.2.3.4',
		ttl: 300,
		proxied: true,
	};

	it('returns true for identical records', () => {
		expect(recordsAreEqual(base, { ...base })).toBe(true);
	});

	it('returns false if existing is null', () => {
		expect(recordsAreEqual(null, base)).toBe(false);
	});

	it('returns false if type differs', () => {
		expect(recordsAreEqual({ ...base, type: 'AAAA' }, base)).toBe(false);
	});

	it('returns false if content differs', () => {
		expect(recordsAreEqual({ ...base, content: '9.9.9.9' }, base)).toBe(false);
	});

	it('returns false if ttl differs', () => {
		expect(recordsAreEqual({ ...base, ttl: 600 }, base)).toBe(false);
	});

	it('returns false if proxied differs', () => {
		expect(recordsAreEqual({ ...base, proxied: false }, base)).toBe(false);
	});
});
