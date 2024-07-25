'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useState} from 'react';

export default function ExampleGenerateTextRouteHandler() {
	const [prompt, setPrompt] = useState('');
	const [completion, setCompletion] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim()) return;

		setLoading(true);
		setCompletion('');

		try {
			const response = await fetch('/api/langbase/pipe/stream-text', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({prompt: prompt}),
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const reader = response.body?.getReader();

			if (!reader) {
				throw new Error('Unable to read stream');
			}

			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const {done, value} = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, {stream: true});
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.trim()) {
						const chunk = JSON.parse(line);
						const content = chunk.choices[0]?.delta?.content || '';
						setCompletion(prev => prev + content);
					}
				}
			}

			// Process any remaining data in the buffer
			if (buffer.trim()) {
				const chunk = JSON.parse(buffer);
				const content = chunk.choices[0]?.delta?.content || '';
				setCompletion(prev => prev + content);
			}
		} catch (error) {
			console.error('Error:', error);
			setCompletion('An error occurred while generating the completion.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-2 w-full">
				<p className="text-lg font-semibold">
					2. Generate Text{' '}
					<a
						className="text-indigo-500"
						href="https://langbase.com/docs"
					>
						`streamText()`
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
					<strong>Completion:</strong> {completion}
				</p>
			)}
		</>
	);
}
