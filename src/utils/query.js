export function parseQueryParams(request) {
	const url = new URL(request.url);
	const hostname = url.searchParams.get('hostname');
	const ip = url.searchParams.get('ip');

	if (!hostname || !ip) throw new Error('Missing hostname or ip');

	const overrides = {
		type: url.searchParams.get('type') || undefined,
		ttl: toNumber(url.searchParams.get('ttl')),
		proxied: toBoolean(url.searchParams.get('proxied')),
	};

	return { hostname, ip, overrides };
}

function toBoolean(val) {
	if (val === 'true') return true;
	if (val === 'false') return false;
	return undefined;
}

function toNumber(val) {
	const num = parseInt(val);
	return isNaN(num) ? undefined : num;
}
