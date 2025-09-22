/**
 * Example demonstrating the enhanced developer experience features
 */
import 'dotenv/config';
import { Langbase } from '../src/index';

async function demonstrateEnhancements() {
	console.log('🚀 Demonstrating Langbase SDK Developer Experience Enhancements\n');

	try {
		// 1. Enhanced constructor with validation
		console.log('1. Creating Langbase instance with validation...');
		const langbase = new Langbase({
			apiKey: process.env.LANGBASE_API_KEY || 'lb_demo_key', // This should trigger validation
		});

		// 2. Convenience methods for quick usage
		console.log('2. Using convenience methods...');
		
		// Create messages using utilities
		const messages = [
			langbase.utils.systemMessage('You are a helpful assistant'),
			langbase.utils.userMessage('What is TypeScript?'),
		];
		console.log('Created messages:', messages);

		// 3. Message builder pattern
		console.log('3. Using message builder...');
		const builder = langbase.utils.createMessageBuilder('demo-pipe')
			.system('You are a coding expert')
			.user('Explain JavaScript promises')
			.assistant('Promises are a way to handle asynchronous operations...')
			.user('How do I use async/await?');

		console.log('Builder message count:', builder.count());
		console.log('Last message:', builder.lastMessage());

		// 4. Debug utilities
		console.log('4. Testing debug utilities...');
		langbase.utils.debug.enable();
		console.log('Debug enabled');
		
		// 5. Error handling enhancement would be shown in actual API calls
		console.log('5. Enhanced error handling will be shown during API failures');

		// 6. Quick conversation helper
		console.log('6. Creating conversation...');
		const conversation = langbase.utils.createConversation([
			{ user: 'Hello!', assistant: 'Hi there!' },
			{ user: 'How are you?', assistant: 'I am doing well, thank you!' }
		]);
		console.log('Conversation:', conversation);

		console.log('\n✅ All developer experience enhancements demonstrated successfully!');

	} catch (error) {
		console.error('❌ Error:', error);
		
		// Show enhanced error information if available
		if (error instanceof Error && 'info' in error) {
			console.log('Enhanced error info:', (error as any).info);
		}
	}
}

// Only run if this file is executed directly
if (require.main === module) {
	demonstrateEnhancements().catch(console.error);
}

export { demonstrateEnhancements };