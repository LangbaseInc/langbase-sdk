type WorkflowContext = {
	outputs: Record<string, any>;
};

type RetryConfig = {
	limit: number;
	delay: number;
	backoff: 'exponential' | 'linear' | 'fixed';
};

type StepConfig<T = any> = {
	id: string;
	timeout?: number;
	retries?: RetryConfig;
	run: () => Promise<T>;
};

class TimeoutError extends Error {
	constructor(stepId: string, timeout: number) {
		super(`Step "${stepId}" timed out after ${timeout}ms`);
		this.name = 'TimeoutError';
	}
}

export class Workflow {
	private context: WorkflowContext;
	private debug: boolean;
	public readonly step: <T = any>(config: StepConfig<T>) => Promise<T>;

	constructor(config: {debug?: boolean} = {debug: false}) {
		this.context = {outputs: {}};
		this.debug = config.debug ?? false;
		this.step = this._step.bind(this);
	}

	private async _step<T = any>(config: StepConfig<T>): Promise<T> {
		if (this.debug) {
			console.log(`\n🔄 Starting step: ${config.id}`);
			console.time(`⏱️ Step ${config.id}`);
			if (config.timeout) console.log(`⏳ Timeout: ${config.timeout}ms`);
			if (config.retries)
				console.log(`🔄 Retries: ${JSON.stringify(config.retries)}`);
		}

		let lastError: Error | null = null;
		let attempt = 1;
		const maxAttempts = config.retries?.limit
			? config.retries.limit + 1
			: 1;

		while (attempt <= maxAttempts) {
			try {
				let stepPromise = config.run();

				if (config.timeout) {
					stepPromise = this.withTimeout({
						promise: stepPromise,
						timeout: config.timeout,
						stepId: config.id,
					});
				}

				const result = await stepPromise;
				this.context.outputs[config.id] = result;

				if (this.debug) {
					console.timeEnd(`⏱️ Step ${config.id}`);
					console.log(`📤 Output:`, result);
					console.log(`✅ Completed step: ${config.id}\n`);
				}

				return result;
			} catch (error) {
				lastError = error as Error;

				if (attempt < maxAttempts) {
					const delay = config.retries
						? this.calculateDelay(
								config.retries.delay,
								attempt,
								config.retries.backoff,
							)
						: 0;

					if (this.debug) {
						console.log(
							`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`,
						);
						console.error(error);
					}

					await this.sleep(delay);
					attempt++;
				} else {
					if (this.debug) {
						console.timeEnd(`⏱️ Step ${config.id}`);
						console.error(`❌ Failed step: ${config.id}`, error);
					}
					throw lastError;
				}
			}
		}

		throw lastError;
	}

	private async withTimeout<T>({
		promise,
		timeout,
		stepId,
	}: {
		promise: Promise<T>;
		timeout: number;
		stepId: string;
	}): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(
				() => reject(new TimeoutError(stepId, timeout)),
				timeout,
			);
		});
		return Promise.race([promise, timeoutPromise]);
	}

	private calculateDelay(
		baseDelay: number,
		attempt: number,
		backoff: RetryConfig['backoff'],
	): number {
		switch (backoff) {
			case 'exponential':
				return baseDelay * Math.pow(2, attempt - 1);
			case 'linear':
				return baseDelay * attempt;
			case 'fixed':
			default:
				return baseDelay;
		}
	}

	private async sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
