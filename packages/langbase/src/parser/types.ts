export type ContentType =
	| 'application/pdf'
	| 'text/plain'
	| 'text/markdown'
	| 'text/csv'
	| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	| 'application/vnd.ms-excel';

export type ParseOptions = {
	document: Buffer | File | FormData | ReadableStream;
	documentName: string;
	contentType: ContentType;
};

export type ParseResponse = {
	documentName: string;
	content: string;
};
