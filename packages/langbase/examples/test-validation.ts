/**
 * Test to verify enhanced error handling and validation
 */
import { Langbase, LangbaseError } from '../src/index';

async function testValidationErrors() {
	console.log('🧪 Testing Enhanced Error Handling and Validation\n');

	// Test 1: Constructor validation with invalid API key format
	console.log('1. Testing constructor validation...');
	try {
		new Langbase({
			apiKey: 'invalid-key-format' // Should trigger validation
		});
		console.log('❌ Expected validation error but none was thrown');
	} catch (error) {
		if (error instanceof LangbaseError) {
			console.log('✅ Caught validation error:', error.message.split('\n')[0]);
			if (error.info?.suggestion) {
				console.log('  💡 Suggestion:', error.info.suggestion);
			}
		} else {
			console.log('❌ Expected LangbaseError but got:', error);
		}
	}

	// Test 2: Constructor with missing API key
	console.log('\n2. Testing missing API key...');
	try {
		new Langbase({} as any);
		console.log('❌ Expected validation error but none was thrown');
	} catch (error) {
		if (error instanceof LangbaseError) {
			console.log('✅ Caught missing API key error:', error.message.split('\n')[0]);
		}
	}

	// Test 3: Valid constructor (should not throw)
	console.log('\n3. Testing valid constructor...');
	try {
		const langbase = new Langbase({
			apiKey: 'lb_valid_key_format'
		});
		console.log('✅ Valid constructor works correctly');

		// Test message validation
		console.log('\n4. Testing message validation...');
		try {
			await langbase.pipes.run({
				name: '', // Empty name should trigger validation
				messages: [] // Empty messages should trigger validation
			});
			console.log('❌ Expected validation error but none was thrown');
		} catch (error) {
			if (error instanceof LangbaseError) {
				console.log('✅ Caught run validation error:', error.message.split('\n')[0]);
			}
		}

	} catch (error) {
		console.log('❌ Valid constructor should not throw:', error);
	}

	console.log('\n✅ All validation tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
	testValidationErrors().catch(console.error);
}

export { testValidationErrors };