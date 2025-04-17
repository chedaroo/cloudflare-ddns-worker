#!/usr/bin/env node
// scripts/trigger.js
// Triggers a request to the Cloudflare DDNS Worker

import enquirer from 'enquirer';

const { prompt } = enquirer;

function toBase64(str) {
	return Buffer.from(str, 'utf-8').toString('base64');
}

const defaultUsername = 'ddns';

const answers = await prompt([
	{
		type: 'input',
		name: 'url',
		message: 'Enter Worker URL (e.g. https://yourname.workers.dev/update):',
		validate: (val) => val.startsWith('http') || 'Must be a valid URL',
	},
	{
		type: 'input',
		name: 'username',
		message: 'Enter BASIC_AUTH_USER:',
		initial: defaultUsername,
		validate: (val) => val.trim() !== '' || 'Required',
	},
	{
		type: 'password',
		name: 'password',
		message: 'Enter BASIC_AUTH_PASS:',
		validate: (val) => val.trim() !== '' || 'Required',
	},
	{
		type: 'input',
		name: 'hostname',
		message: 'Enter hostname to update (e.g. home.example.com):',
		validate: (val) => val.includes('.') || 'Must be a valid FQDN',
	},
	{
		type: 'input',
		name: 'ip',
		message: 'Enter IP address to assign:',
		validate: (val) => val.trim() !== '' || 'Required',
	},
	{
		type: 'select',
		name: 'proxied',
		message: 'Proxy through Cloudflare?',
		choices: ['true', 'false'],
		initial: 'true',
	},
	{
		type: 'input',
		name: 'ttl',
		message: 'TTL (in seconds, leave blank for auto):',
		initial: '',
	},
	{
		type: 'select',
		name: 'type',
		message: 'Record type (optional):',
		choices: ['(skip)', 'A', 'AAAA', 'CNAME'],
		initial: '(skip)',
	},
]);

const params = new URLSearchParams({
	hostname: answers.hostname,
	ip: answers.ip,
	proxied: answers.proxied,
});

if (answers.ttl) params.set('ttl', answers.ttl);
if (answers.type !== '(skip)') params.set('type', answers.type);

const finalUrl = `${answers.url}?${params.toString()}`;
const auth = 'Basic ' + toBase64(`${answers.username}:${answers.password}`);

console.log(`\n➡️  Sending request to: ${finalUrl}`);

try {
	const res = await fetch(finalUrl, {
		method: 'GET',
		headers: {
			Authorization: auth,
		},
	});

	const body = await res.text();
	console.log(`\n✅ Response [${res.status}]:`);
	console.log(body);
} catch (err) {
	console.error(`\n❌ Request failed:`, err.message);
	process.exit(1);
}
