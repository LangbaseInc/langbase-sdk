'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useState} from 'react';
import {getGeneratedText} from './action';

export default function GenerateTextServerAction() {
	const [prompt, setPrompt] = useState('');
	const [completion, setCompletion] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		if (!prompt.trim()) return;

		setLoading(true);
		try {
			const result = await getGeneratedText(prompt);
			setCompletion(result.completion);
		} catch (error) {
			console.error('Error:', error);
			setCompletion('An error occurred while generating the completion.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-2 w-full mt-6">
				<p className="text-lg font-semibold">
					3. Generate Text{' '}
					<a
						className="text-indigo-500"
						href="https://langbase.com/docs"
					>
						`generateText()`
					</a>{' '}
					with Server Action
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
					<strong>Completion:</strong> {completion}
				</p>
			)}
		</>
	);
}
