import { validateBasicAuth, unauthorizedResponse } from './utils/auth.js';
import { parseQueryParams } from './utils/query.js';
import { extractRootDomain } from './utils/dns.js';
import { getZoneId, getDnsRecord, updateDnsRecord, createDnsRecord } from './utils/cloudflare.js';
import { mergeRecord, recordsAreEqual } from './utils/dns.js';
import { responseJSON, responseError } from './utils/response.js';

export async function handleRequest(request, env, ctx) {
	if (!validateBasicAuth(request, env)) {
		return unauthorizedResponse();
	}

	try {
		const { hostname, ip, overrides } = parseQueryParams(request);
		const domain = extractRootDomain(hostname);
		const apiToken = env.CLOUDFLARE_API_TOKEN;

		const zoneId = await getZoneId(domain, apiToken);
		if (!zoneId) return responseError(`Zone not found for ${domain}`, 404);

		const existingRecord = await getDnsRecord(zoneId, hostname, apiToken);
		const finalRecord = mergeRecord(existingRecord, hostname, ip, overrides);

		if (recordsAreEqual(existingRecord, finalRecord)) {
			return new Response('Record unchanged', { status: 200 });
		}

		const result = existingRecord
			? await updateDnsRecord(zoneId, existingRecord.id, finalRecord, apiToken)
			: await createDnsRecord(zoneId, finalRecord, apiToken);

		return responseJSON(result);
	} catch (err) {
		return responseError(`Error: ${err.message}`, 500);
	}
}
