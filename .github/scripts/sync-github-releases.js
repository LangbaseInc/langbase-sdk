#!/usr/bin/env node

/**
 * Script to sync all NPM releases to GitHub releases
 * This will create GitHub releases for all published NPM versions
 * and update the CHANGELOG.md at the repository root
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PACKAGE_NAME = 'langbase';
const CHANGELOG_PATH = path.join(__dirname, '../../packages/langbase/CHANGELOG.md');
const ROOT_CHANGELOG_PATH = path.join(__dirname, '../../CHANGELOG.md');
const INCLUDE_SNAPSHOTS = false; // Set to true if you want to create releases for snapshot versions

/**
 * Execute shell command and return output
 */
function exec(command) {
	try {
		return execSync(command, { encoding: 'utf8' }).trim();
	} catch (error) {
		console.error(`Error executing command: ${command}`);
		console.error(error.message);
		return null;
	}
}

/**
 * Fetch all NPM versions with their publish dates
 */
function fetchNpmVersions() {
	console.log('📦 Fetching all NPM versions...');
	const versionsJson = exec(`npm view ${PACKAGE_NAME} time --json`);
	if (!versionsJson) {
		console.error('Failed to fetch NPM versions');
		process.exit(1);
	}

	const timeData = JSON.parse(versionsJson);
	const versions = [];

	for (const [version, publishDate] of Object.entries(timeData)) {
		// Skip special keys
		if (version === 'created' || version === 'modified') continue;

		// Skip snapshot versions if not including them
		if (!INCLUDE_SNAPSHOTS && version.includes('-snapshot')) continue;

		versions.push({ version, publishDate });
	}

	// Sort by semver
	versions.sort((a, b) => {
		const partsA = a.version.split(/[.-]/).map(p => isNaN(p) ? p : parseInt(p));
		const partsB = b.version.split(/[.-]/).map(p => isNaN(p) ? p : parseInt(p));

		for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
			const partA = partsA[i] ?? 0;
			const partB = partsB[i] ?? 0;

			if (typeof partA === 'number' && typeof partB === 'number') {
				if (partA !== partB) return partA - partB;
			} else {
				if (partA < partB) return -1;
				if (partA > partB) return 1;
			}
		}
		return 0;
	});

	console.log(`✅ Found ${versions.length} versions (excluding snapshots: ${!INCLUDE_SNAPSHOTS})`);
	return versions;
}

/**
 * Parse the CHANGELOG.md file and extract entries for each version
 */
function parseChangelog() {
	console.log('📖 Parsing CHANGELOG.md...');

	if (!fs.existsSync(CHANGELOG_PATH)) {
		console.error(`CHANGELOG not found at ${CHANGELOG_PATH}`);
		return {};
	}

	const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
	const lines = content.split('\n');
	const changelogMap = {};
	let currentVersion = null;
	let currentContent = [];

	for (const line of lines) {
		// Check if this is a version header (e.g., "## 1.2.4")
		const versionMatch = line.match(/^##\s+(\d+\.\d+\.\d+.*?)$/);

		if (versionMatch) {
			// Save previous version content
			if (currentVersion && currentContent.length > 0) {
				changelogMap[currentVersion] = currentContent.join('\n').trim();
			}

			// Start new version
			currentVersion = versionMatch[1];
			currentContent = [];
		} else if (currentVersion && line.trim() !== '') {
			// Add content to current version (skip the title line "# `langbase` SDK")
			if (!line.startsWith('#')) {
				currentContent.push(line);
			}
		}
	}

	// Save last version
	if (currentVersion && currentContent.length > 0) {
		changelogMap[currentVersion] = currentContent.join('\n').trim();
	}

	console.log(`✅ Parsed changelog entries for ${Object.keys(changelogMap).length} versions`);
	return changelogMap;
}

/**
 * Check if a GitHub release already exists
 */
function releaseExists(version) {
	const result = exec(`gh release view ${version} 2>&1`);
	return result && !result.includes('release not found');
}

/**
 * Create a GitHub release
 */
function createGitHubRelease(version, publishDate, changelogEntry) {
	const tag = version;
	const title = `langbase v${version}`;

	// If no changelog entry, use a default message
	let notes = changelogEntry || 'Release notes not available.';

	// Add publish date to notes
	const dateStr = new Date(publishDate).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	notes += `\n\n---\n*Published on ${dateStr}*`;

	// Create the release
	const notesFile = `/tmp/release-notes-${version}.md`;
	fs.writeFileSync(notesFile, notes);

	try {
		const command = `gh release create "${tag}" \
			--title "${title}" \
			--notes-file "${notesFile}" \
			--target main`;

		exec(command);
		console.log(`  ✅ Created release ${version}`);
		return true;
	} catch (error) {
		console.error(`  ❌ Failed to create release ${version}: ${error.message}`);
		return false;
	} finally {
		// Clean up temp file
		if (fs.existsSync(notesFile)) {
			fs.unlinkSync(notesFile);
		}
	}
}

/**
 * Create GitHub releases for all versions
 */
function createAllReleases(versions, changelogMap) {
	console.log('\n🚀 Creating GitHub releases...\n');

	let created = 0;
	let skipped = 0;
	let failed = 0;

	for (const { version, publishDate } of versions) {
		// Check if release already exists
		if (releaseExists(version)) {
			console.log(`  ⏭️  Release ${version} already exists, skipping...`);
			skipped++;
			continue;
		}

		// Get changelog entry
		const changelogEntry = changelogMap[version];

		// Create the release
		const success = createGitHubRelease(version, publishDate, changelogEntry);

		if (success) {
			created++;
		} else {
			failed++;
		}

		// Add a small delay to avoid rate limiting
		if (created % 10 === 0 && created > 0) {
			console.log('  ⏸️  Pausing for 2 seconds to avoid rate limiting...');
			execSync('sleep 2');
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`   Created: ${created}`);
	console.log(`   Skipped: ${skipped}`);
	console.log(`   Failed: ${failed}`);
	console.log(`   Total: ${versions.length}`);
}

/**
 * Create consolidated CHANGELOG.md at repository root
 */
function createRootChangelog() {
	console.log('\n📝 Creating consolidated CHANGELOG.md at repository root...');

	if (!fs.existsSync(CHANGELOG_PATH)) {
		console.error('Package CHANGELOG.md not found');
		return;
	}

	const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');

	// Add a header
	const rootChangelog = `# Changelog

All notable changes to the Langbase SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

${content}
`;

	fs.writeFileSync(ROOT_CHANGELOG_PATH, rootChangelog);
	console.log(`✅ Created ${ROOT_CHANGELOG_PATH}`);
}

/**
 * Main execution
 */
function main() {
	console.log('🎯 Starting GitHub Releases Sync\n');

	// Step 1: Fetch all NPM versions
	const versions = fetchNpmVersions();

	// Step 2: Parse changelog
	const changelogMap = parseChangelog();

	// Step 3: Create all GitHub releases
	createAllReleases(versions, changelogMap);

	// Step 4: Create root CHANGELOG.md
	createRootChangelog();

	console.log('\n✨ Done! All releases have been synced to GitHub.');
}

// Run the script
main();
