import GenerateTextExample from '@/components/langbase/generate-text';
import StreamTextExample from '@/components/langbase/stream-text';

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="flex flex-col items-center justify-between gap-10 max-w-lg w-full">
				<div className="flex flex-col gap-1 w-full">
					<h2 className="text-2xl font-bold tracking-tight">
						⌘ Langbase AI Pipe
					</h2>
					<p className="text-muted-foreground">
						An AI agent that responds to your prompts.
					</p>
				</div>
				<GenerateTextExample />
				<StreamTextExample />
			</div>
		</div>
	);
}
