export function validateBasicAuth(request, env) {
	const header = request.headers.get('Authorization');
	if (!header || !header.startsWith('Basic ')) {
		return false;
	}

	try {
		const encoded = header.slice(6); // remove 'Basic '
		const decoded = atob(encoded); // decode base64
		const [name, pass] = decoded.split(':');

		return name === env.BASIC_AUTH_USER && pass === env.BASIC_AUTH_PASS;
	} catch {
		return false;
	}
}

export function unauthorizedResponse() {
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="Cloudflare DDNS Worker"',
		},
	});
}
