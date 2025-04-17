import { describe, it, expect } from 'vitest';
import { parseQueryParams } from '../src/utils/query.js';

function makeRequest(url) {
	return new Request(url);
}

describe('parseQueryParams', () => {
	it('parses required params', () => {
		const req = makeRequest('https://worker/update?hostname=home.example.com&ip=1.2.3.4');
		const result = parseQueryParams(req);
		expect(result.hostname).toBe('home.example.com');
		expect(result.ip).toBe('1.2.3.4');
	});

	it('parses optional proxied and ttl', () => {
		const req = makeRequest('https://worker/update?hostname=test.com&ip=5.6.7.8&proxied=false&ttl=300');
		const result = parseQueryParams(req);
		expect(result.overrides.proxied).toBe(false);
		expect(result.overrides.ttl).toBe(300);
	});

	it('returns undefined for missing optional values', () => {
		const req = makeRequest('https://worker/update?hostname=test.com&ip=9.9.9.9');
		const result = parseQueryParams(req);
		expect(result.overrides.ttl).toBeUndefined();
		expect(result.overrides.proxied).toBeUndefined();
	});

	it('throws for missing hostname or ip', () => {
		const req = makeRequest('https://worker/update?hostname=test.com');
		expect(() => parseQueryParams(req)).toThrow();
	});
});
