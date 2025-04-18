import { describe, it, expect } from 'vitest';
import { parseQueryParams } from '../src/utils/query.js';

function makeRequest(query) {
	return new Request(`https://example.com/update?${query}`);
}

describe('parseQueryParams', () => {
	it('parses hostname and ip correctly', () => {
		const req = makeRequest('hostname=home.example.com&ip=1.2.3.4');
		const result = parseQueryParams(req);
		expect(result.hostname).toBe('home.example.com');
		expect(result.ip).toBe('1.2.3.4');
	});

	it('parses override params', () => {
		const req = makeRequest('hostname=a.com&ip=1.1.1.1&type=A&ttl=3600&proxied=true');
		const { overrides } = parseQueryParams(req);
		expect(overrides.type).toBe('A');
		expect(overrides.ttl).toBe(3600);
		expect(overrides.proxied).toBe(true);
	});

	it('handles default override values', () => {
		const req = makeRequest('hostname=a.com&ip=1.1.1.1');
		const { overrides } = parseQueryParams(req);
		expect(overrides.type).toBeUndefined();
		expect(overrides.ttl).toBeUndefined();
		expect(overrides.proxied).toBeUndefined();
	});

	it('throws if hostname is missing', () => {
		const req = makeRequest('ip=1.1.1.1');
		expect(() => parseQueryParams(req)).toThrow('Missing hostname or ip');
	});

	it('throws if ip is missing', () => {
		const req = makeRequest('hostname=a.com');
		expect(() => parseQueryParams(req)).toThrow('Missing hostname or ip');
	});

	it('parses proxied=false correctly', () => {
		const req = makeRequest('hostname=a.com&ip=1.1.1.1&proxied=false');
		const { overrides } = parseQueryParams(req);
		expect(overrides.proxied).toBe(false);
	});

	it('ignores non-numeric ttl', () => {
		const req = makeRequest('hostname=a.com&ip=1.1.1.1&ttl=abc');
		const { overrides } = parseQueryParams(req);
		expect(overrides.ttl).toBeUndefined();
	});
});
