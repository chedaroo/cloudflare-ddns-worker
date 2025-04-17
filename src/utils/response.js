export function responseJSON(data) {
	return new Response(JSON.stringify(data, null, 2), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function responseError(message, status = 500) {
	return new Response(message, { status });
}
