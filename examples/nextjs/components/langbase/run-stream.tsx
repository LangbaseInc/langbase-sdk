'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {getRunner} from 'langbase';
import {useState} from 'react';

export default function RunStreamExample() {
	const [prompt, setPrompt] = useState('');
	const [completion, setCompletion] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim() || loading) return;

		setLoading(true);
		setCompletion('');

		try {
			const response = await fetch('/langbase/pipe/run-stream', {
				method: 'POST',
				body: JSON.stringify([{role: 'user', content: prompt}]),
				headers: {'Content-Type': 'text/plain'},
			});

			if (response.body) {
				const stream = getRunner(response.body);

				// Method #1 to get all of the chunk.
				for await (const chunk of stream) {
					const content = chunk?.choices[0]?.delta?.content;
					content && setCompletion(prev => prev + content);
				}

				// // Method #2 to get only the chunk's content as delta of the chunks
				// stream.on('content', content => {
				// setCompletion(prev => prev + content);
				// });
			}
		} catch (error) {
			setLoading(false);
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-neutral-200 rounded-md p-2 flex flex-col gap-2 w-full">
			<div className="flex flex-col gap-2 w-full">
				<p className="text-lg font-semibold">
					1. Stream Text{' '}
					<a
						className="text-indigo-500"
						href="https://langbase.com/docs/langbase-sdk/stream-text"
					>
						`pipe.run()`
					</a>{' '}
					with Route Handler
				</p>
				<p className="text-muted-foreground">
					Ask a prompt to stream a text completion.
				</p>
			</div>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col w-full items-center gap-2"
			>
				<Input
					type="text"
					placeholder="Enter prompt message here"
					onChange={e => setPrompt(e.target.value)}
					value={prompt}
					required
				/>
				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? 'AI is thinking...' : 'Ask AI'}
				</Button>
			</form>
			{completion && (
				<p className="mt-4">
					<strong>Stream:</strong> {completion}
				</p>
			)}
		</div>
	);
}
