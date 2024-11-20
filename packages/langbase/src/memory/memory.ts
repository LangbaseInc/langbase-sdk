import {Request} from '../common/request';

export interface MemoryOptions {
	apiKey: string;
}

interface MemoryBaseResponse {
	name: string;
	description: string;
	owner_login: string;
	url: string;
}

export interface MemoryCreateOptions {
	name: string;
	description?: string;
}

export interface MemoryCreateResponse extends MemoryBaseResponse {}
export interface MemoryListResponse extends MemoryBaseResponse {}

export class Memory {
	private request: Request;

	constructor(options: MemoryOptions) {
		const baseUrl = 'https://api.langbase.com';
		this.request = new Request({apiKey: options.apiKey, baseUrl});
	}

	async create(options: MemoryCreateOptions): Promise<MemoryCreateResponse> {
		return this.request.post({
			endpoint: '/v1/memory',
			body: options,
		});
	}

	async list(): Promise<MemoryListResponse[]> {
		return this.request.get({
			endpoint: '/v1/memory',
		});
	}
}
