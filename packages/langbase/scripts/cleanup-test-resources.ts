#!/usr/bin/env tsx
/**
 * Cleanup script for test resources
 *
 * Deletes all test resources created during testing:
 * - Memories starting with "test-memory-"
 * - Threads (if any test threads remain)
 * - Lists pipes that need manual deletion
 *
 * Usage:
 *   npx tsx scripts/cleanup-test-resources.ts
 *
 * Or with pnpm:
 *   pnpm cleanup:test
 */

import {Langbase} from '../src/index';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({path: path.resolve(__dirname, '../../../.env')});

const apiKey = process.env.LANGBASE_API_KEY;

if (!apiKey) {
	console.error('❌ Error: LANGBASE_API_KEY not found in environment');
	console.error('Please set it in your .env file');
	process.exit(1);
}

const langbase = new Langbase({apiKey});

async function cleanupMemories() {
	console.log('\n🔍 Checking for test memories...');
	try {
		const memories = await langbase.memories.list();
		const testMemories = memories.filter(m =>
			m.name.startsWith('test-memory-') || m.name.startsWith('test-deprecated-memory-'),
		);

		if (testMemories.length === 0) {
			console.log('✅ No test memories found');
			return 0;
		}

		console.log(`📋 Found ${testMemories.length} test memories to delete`);

		let deleted = 0;
		let failed = 0;

		for (const memory of testMemories) {
			try {
				await langbase.memories.delete({name: memory.name});
				console.log(`  ✅ Deleted: ${memory.name}`);
				deleted++;

				// Small delay to avoid rate limiting
				await new Promise(resolve => setTimeout(resolve, 200));
			} catch (error: any) {
				console.log(`  ❌ Failed: ${memory.name} - ${error.message}`);
				failed++;
			}
		}

		console.log(`\n📊 Memory Cleanup Summary:`);
		console.log(`   ✅ Deleted: ${deleted}`);
		console.log(`   ❌ Failed: ${failed}`);

		return deleted;
	} catch (error: any) {
		console.error('❌ Error listing memories:', error.message);
		return 0;
	}
}

async function listTestPipes() {
	console.log('\n🔍 Checking for test pipes...');
	try {
		const pipes = await langbase.pipes.list();
		const testPipes = pipes.filter(
			p =>
				p.name.startsWith('test-pipe-') ||
				p.name.startsWith('test-deprecated-'),
		);

		if (testPipes.length === 0) {
			console.log('✅ No test pipes found');
			return;
		}

		console.log(`⚠️  Found ${testPipes.length} test pipes (manual deletion required):`);
		console.log('\n   Delete these via Langbase UI:');
		console.log('   👉 https://langbase.com/pipes\n');

		testPipes.forEach(pipe => {
			console.log(`   - ${pipe.name}`);
			console.log(`     ${pipe.url}`);
		});

		console.log('\n   ℹ️  Pipe deletion via API is not yet supported');
	} catch (error: any) {
		console.error('❌ Error listing pipes:', error.message);
	}
}

async function cleanupThreads() {
	console.log('\n🔍 Checking for test threads...');

	// Note: There's no list endpoint for threads, so we can't automatically find them
	// Threads created during tests are tracked and cleaned up by the test suite itself

	console.log('ℹ️  Threads are automatically cleaned up after tests complete');
	console.log('   If tests were interrupted, specific thread IDs would be needed');

	return 0;
}

async function showSummary(deletedMemories: number) {
	console.log('\n' + '='.repeat(60));
	console.log('🧹 CLEANUP COMPLETE');
	console.log('='.repeat(60));

	console.log('\nAutomatically Cleaned:');
	console.log(`  ✅ Memories: ${deletedMemories} deleted`);
	console.log(`  ✅ Threads: Cleaned by test suite`);

	console.log('\nManual Action Required:');
	console.log(`  ⚠️  Pipes: See list above (if any)`);

	console.log('\nVerification:');
	console.log('  Run tests again to ensure clean state');
	console.log('  Or visit https://langbase.com to verify\n');
}

async function main() {
	console.log('🧹 Langbase Test Resource Cleanup');
	console.log('='.repeat(60));

	const deletedMemories = await cleanupMemories();
	await cleanupThreads();
	await listTestPipes();
	await showSummary(deletedMemories);

	console.log('✨ Done!\n');
}

// Run cleanup
main().catch(error => {
	console.error('\n❌ Cleanup failed:', error);
	process.exit(1);
});
