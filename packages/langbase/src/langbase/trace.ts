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

export type TraceType =
	| 'workflow'
	| 'agent'
	| 'chunk'
	| 'memory'
	| 'parse'
	| 'embed';

export type PrimitiveTrace =
	| {chunk: any}
	| {agent: any}
	| {memory: any}
	| {parse: any}
	| {embed: any}
	| {workflow: WorkflowTrace; entityAuthId: string};

type WorkflowTrace = {
	createdAt: string;
	id: string;
	agentWorkflowId: string;
	name: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	steps: StepTrace[];
	error?: string;
};

export class TraceManager {
	private traces: Map<string, PrimitiveTrace> = new Map();

	createTrace(type: TraceType, traceData: any = {}): string {
		const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		let trace: PrimitiveTrace;
		const createdAt = new Date().toISOString();
		if (type === 'workflow') {
			trace = {
				workflow: {
					createdAt,
					id: traceId,
					agentWorkflowId: traceData.agentWorkflowId || '',
					name: traceData.name || '',
					startTime: Date.now(),
					steps: [],
				},
				entityAuthId: '',
			};
		} else if (type === 'agent') {
			trace = {agent: {...traceData, createdAt, id: traceId}};
		} else if (type === 'chunk') {
			trace = {chunk: {...traceData, createdAt, id: traceId}};
		} else if (type === 'memory') {
			trace = {memory: {...traceData, createdAt, id: traceId}};
		} else if (type === 'parse') {
			trace = {parse: {...traceData, createdAt, id: traceId}};
		} else if (type === 'embed') {
			trace = {embed: {...traceData, createdAt, id: traceId}};
		} else {
			throw new Error('Unknown trace type');
		}
		this.traces.set(traceId, trace);
		return traceId;
	}

	addStep(traceId: string, step: StepTrace) {
		const trace = this.traces.get(traceId);
		if (trace && 'workflow' in trace) {
			trace.workflow.steps.push(step);
		}
	}

	endTrace(traceId: string) {
		const trace = this.traces.get(traceId);
		if (trace && 'workflow' in trace) {
			trace.workflow.endTime = Date.now();
			trace.workflow.duration =
				trace.workflow.endTime - trace.workflow.startTime;
		}
	}

	getTrace(traceId: string): PrimitiveTrace | undefined {
		return this.traces.get(traceId);
	}

	printTrace(traceId: string) {
		const trace = this.traces.get(traceId);
		if (!trace) return;
		if ('workflow' in trace) {
			const wf = trace.workflow;
			const duration = wf.endTime
				? wf.endTime - wf.startTime
				: Date.now() - wf.startTime;
			console.log('\n📊 Workflow Trace:');
			console.log(`Name: ${wf.name}`);
			console.log(`Duration: ${duration}ms`);
			console.log(`Start Time: ${new Date(wf.startTime).toISOString()}`);
			if (wf.endTime) {
				console.log(`End Time: ${new Date(wf.endTime).toISOString()}`);
			}
			console.log('\nSteps:');
			wf.steps.forEach(step => {
				console.log(`\n  Step: ${step.name}`);
				console.log(`  Duration: ${step.duration}ms`);
				if (step.traces && step.traces.length > 0) {
					console.log(`  Traces:`, step.traces);
				}
				console.log(`  Output:`, step.output);
			});
		} else {
			console.log('\n📊 Primitive Trace:');
			console.dir(trace, {depth: 4});
		}
	}
}
