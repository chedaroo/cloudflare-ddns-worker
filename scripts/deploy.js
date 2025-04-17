#!/usr/bin/env node
// scripts/deploy.js
// Interactive deploy script for Cloudflare DDNS Worker

import enquirer from 'enquirer';
import { execSync } from 'node:child_process';
import crypto from 'crypto';

const { prompt } = enquirer;

function generatePassword(length = 32) {
	return crypto
		.randomBytes(length)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.slice(0, length);
}

const defaultUsername = 'ddns';
const defaultPassword = generatePassword();

// Step 1: Prompt for vars and secrets with defaults
const answers = await prompt([
	{
		type: 'input',
		name: 'BASIC_AUTH_USER',
		message: 'Enter BASIC_AUTH_USER:',
		initial: defaultUsername,
		validate: (val) => val.trim() !== '' || 'Required',
	},
	{
		type: 'password',
		name: 'BASIC_AUTH_PASS',
		message: 'Enter BASIC_AUTH_PASS (auto-generated if blank):',
		initial: defaultPassword,
		validate: (val) => val.trim() !== '' || 'Required',
	},
	{
		type: 'password',
		name: 'CLOUDFLARE_API_TOKEN',
		message: 'Enter CLOUDFLARE_API_TOKEN:',
		validate: (val) => val.trim() !== '' || 'Required',
	},
]);

// Step 2: Confirm before continuing
const { proceed } = await prompt({
	type: 'confirm',
	name: 'proceed',
	message: 'Proceed with deployment?',
	initial: true,
});

if (!proceed) {
	console.log('🚫 Deployment cancelled');
	process.exit(0);
}

// Step 3: Deploy first (must happen before setting secrets)
try {
	execSync(`wrangler deploy --var BASIC_AUTH_USER:${answers.BASIC_AUTH_USER}`, {
		stdio: 'inherit',
		shell: true,
	});
	console.log('\n✅ Deployment complete');
} catch (err) {
	console.error('❌ Deployment failed');
	process.exit(1);
}

// Step 4: Set secrets (after deploy creates the Worker)
function setSecret(name, value) {
	try {
		execSync(`echo "${value}" | wrangler secret put ${name}`, {
			stdio: 'inherit',
		});
	} catch (err) {
		console.error(`❌ Failed to set secret: ${name}`);
		process.exit(1);
	}
}

setSecret('BASIC_AUTH_PASS', answers.BASIC_AUTH_PASS);
setSecret('CLOUDFLARE_API_TOKEN', answers.CLOUDFLARE_API_TOKEN);

// Step 5: Echo summary
console.log('\n📋 Deployment Summary:');
console.log(`BASIC_AUTH_USER = ${answers.BASIC_AUTH_USER}`);
console.log(`BASIC_AUTH_PASS = ${answers.BASIC_AUTH_PASS}`);
console.log(`Secrets set: BASIC_AUTH_PASS, CLOUDFLARE_API_TOKEN`);
