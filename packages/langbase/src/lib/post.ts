export const post = async function ({
	url,
	data,
	headers,
}: {
	url: string;
	data: any;
	headers: any;
}) {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: JSON.stringify(data),
	});
	return response;
};

export const resOk = function (response: Response) {
	if (!response.ok) {
		throw new Error(`Error: ${response.status} ${response.statusText}`);
	}
};
