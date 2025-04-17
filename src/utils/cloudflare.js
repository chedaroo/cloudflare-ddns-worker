export async function getZoneId(domain, token) {
	const res = await cfApi(`zones?name=${domain}`, token);
	return res.result?.[0]?.id || null;
}

export async function getDnsRecord(zoneId, hostname, token) {
	const res = await cfApi(`zones/${zoneId}/dns_records?name=${hostname}`, token);
	return res.result?.[0] || null;
}

export async function updateDnsRecord(zoneId, recordId, record, token) {
	return await cfApi(`zones/${zoneId}/dns_records/${recordId}`, token, 'PUT', record);
}

export async function createDnsRecord(zoneId, record, token) {
	return await cfApi(`zones/${zoneId}/dns_records`, token, 'POST', record);
}

async function cfApi(path, token, method = 'GET', body = null) {
	const res = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: body ? JSON.stringify(body) : null,
	});

	const data = await res.json();
	if (!res.ok) throw new Error(data.errors?.[0]?.message || 'Cloudflare API error');
	return data;
}
