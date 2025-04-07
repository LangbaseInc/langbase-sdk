'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useState} from 'react';

export default function RunNonStreamExample() {
	const [prompt, setPrompt] = useState('');
	const [completion, setCompletion] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		if (!prompt.trim()) return;

		setLoading(true);
		try {
			const response = await fetch('/langbase/pipe/run', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({prompt}),
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			setCompletion(data.completion);
		} catch (error) {
			console.error('Error:', error);
			setCompletion('An error occurred while generating the completion.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-neutral-200 rounded-md p-2 flex flex-col gap-2 w-full">
			<div className="flex flex-col gap-2 w-full">
				<p className="text-lg font-semibold">
					2. Generate Text{' '}
					<a
						className="text-indigo-500"
						href="https://langbase.com/docs/langbase-sdk/generate-text"
					>
						`pipe.run()`
					</a>{' '}
					with Route Handler
				</p>
				<p className="text-muted-foreground">
					Ask a prompt to generate a text completion.
				</p>
			</div>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col w-full items-center gap-2"
			>
				<Input
					type="text"
					placeholder="Enter prompt message here"
					value={prompt}
					onChange={e => setPrompt(e.target.value)}
					required
				/>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? 'AI is thinking...' : 'Ask AI'}
				</Button>
			</form>

			{!loading && completion && (
				<p className="mt-4">
					<strong>Generated completion:</strong> {completion}
				</p>
			)}
		</div>
	);
}
