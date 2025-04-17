export function extractRootDomain(hostname) {
	return hostname.split('.').slice(-2).join('.');
}

export function mergeRecord(existing, hostname, ip, overrides) {
	return {
		type: overrides.type || existing?.type || 'A',
		name: hostname,
		content: ip,
		ttl: overrides.ttl ?? existing?.ttl ?? 1,
		proxied: overrides.proxied ?? existing?.proxied ?? true,
	};
}

export function recordsAreEqual(existing, current) {
	if (!existing) return false;
	return (
		existing.type === current.type &&
		existing.content === current.content &&
		existing.ttl === current.ttl &&
		existing.proxied === current.proxied
	);
}
