export interface Trace {
	name: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	steps: StepTrace[];
	error?: string;
}

export interface StepTrace {
	name: string;
	output: any;
	error?: string;
	traces: string[] | null;
	duration: number;
	startTime: number;
	endTime: number;
}

export class TraceManager {
	private traces: Map<string, Trace> = new Map();

	createTrace(name: string): string {
		const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		this.traces.set(traceId, {
			name,
			startTime: Date.now(),
			steps: [],
		});
		return traceId;
	}

	addStep(traceId: string, step: StepTrace) {
		const trace = this.traces.get(traceId);
		if (trace) {
			trace.steps.push(step);
		}
	}

	endTrace(traceId: string) {
		const trace = this.traces.get(traceId);
		if (trace) {
			trace.endTime = Date.now();
			trace.duration = trace.endTime - trace.startTime;
		}
	}

	getTrace(traceId: string): Trace | undefined {
		return this.traces.get(traceId);
	}

	printTrace(traceId: string) {
		const trace = this.traces.get(traceId);
		if (trace) {
			const duration = trace.endTime
				? trace.endTime - trace.startTime
				: Date.now() - trace.startTime;
			console.log('\n📊 Workflow Trace:');
			console.log(`Name: ${trace.name}`);
			console.log(`Duration: ${duration}ms`);
			console.log(
				`Start Time: ${new Date(trace.startTime).toISOString()}`,
			);
			if (trace.endTime) {
				console.log(
					`End Time: ${new Date(trace.endTime).toISOString()}`,
				);
			}
			console.log('\nSteps:');
			trace.steps.forEach(step => {
				console.log(`\n  Step: ${step.name}`);
				console.log(`  Duration: ${step.duration}ms`);

				// Make sure to check for both existence and non-empty array
				if (step.traces && step.traces.length > 0) {
					console.log(`  Traces:`, step.traces);
				}

				console.log(`  Output:`, step.output);
			});
		}
	}
}
