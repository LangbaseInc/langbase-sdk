import {Langbase} from 'langbase';

/**
 * 1. Run memory.create.ts file to create a memory first.
 * 2. Add your API key to the environment variables or replace it in the code.
 */

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	// Basic text addition
	const basicResult = await langbase.memories.add({
		memoryName: 'my-knowledge-base',
		text: 'This is important information about machine learning fundamentals. It covers supervised learning, unsupervised learning, and reinforcement learning concepts.',
	});

	console.log('✅ Basic text added:', basicResult);

	// Text addition with custom name and metadata
	const detailedResult = await langbase.memories.add({
		memoryName: 'my-knowledge-base',
		text: 'Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers to model and understand complex patterns in data. It has revolutionized fields like computer vision, natural language processing, and speech recognition.',
		documentName: 'deep-learning-intro',
		metadata: {
			category: 'machine-learning',
			topic: 'deep-learning',
			difficulty: 'intermediate',
			source: 'manual-entry',
		},
	});

	console.log('✅ Detailed text added:', detailedResult);

	// Multiple text entries
	const texts = [
		{
			text: 'Supervised learning uses labeled training data to learn a mapping from inputs to outputs.',
			documentName: 'supervised-learning',
			metadata: { type: 'definition', category: 'ml-concepts' },
		},
		{
			text: 'Unsupervised learning finds hidden patterns in data without using labeled examples.',
			documentName: 'unsupervised-learning',
			metadata: { type: 'definition', category: 'ml-concepts' },
		},
		{
			text: 'Reinforcement learning learns optimal actions through trial and error interactions with an environment.',
			documentName: 'reinforcement-learning',
			metadata: { type: 'definition', category: 'ml-concepts' },
		},
	];

	console.log('\n📝 Adding multiple texts...');
	for (const item of texts) {
		const result = await langbase.memories.add({
			memoryName: 'my-knowledge-base',
			...item,
		});
		console.log(`✅ Added: ${result.documentName}`);
	}

	console.log('\n🎉 All texts have been added to the memory!');
	console.log('You can now query this memory to retrieve relevant information.');
}

main()
	.then(() => {
		console.log('\n✨ Text addition completed successfully');
	})
	.catch(error => {
		console.error('❌ Error:', error);
	});