import { JSDOM } from 'jsdom';

/**
 * Fetches a list of all the docs on the langbase website
 *
 *
 * @returns {Promise<string>} A promise that resolves to a string of all the docs on the langbase website
 */
export async function fetchDocsList() {
	try {
		const response = await fetch('https://langbase.com/docs/llms.txt');
		if (!response.ok) {
			throw new Error('Failed to fetch docs');
		}

		const text = await response.text();
		return text;
	} catch (error) {
		throw new Error('Failed to fetch docs ' + JSON.stringify(error));
	}
}

export async function fetchSdkDocsList() {
	try {
		const response = await fetch('https://langbase.com/docs/llms-sdk.txt');
		if (!response.ok) {
			throw new Error('Failed to fetch docs');
		}

		const text = await response.text();
		return text;
	} catch (error) {
		throw new Error('Failed to fetch docs ' + JSON.stringify(error));
	}
}

/**
 * Fetches and converts a blog post to markdown
 *
 *
 * @param {string} url - The URL of the blog post to fetch
 * @returns {Promise<string>} A promise that resolves to a string of the blog post in markdown format
 */
export async function fetchDocsPost(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to fetch blog post');
		}

		const html = await response.text();

		const dom = new JSDOM(html);
		const document = dom.window.document;

		// Remove Next.js initialization code
		const scripts = document.querySelectorAll('script');
		scripts.forEach(script => script.remove());

		// Get the main content
		const content = document.body.textContent?.trim() || '';

		if (!content) {
			throw new Error('No content found in docs');
		}

		return content;
	} catch (error) {
		console.error('Error fetching docs:', error);
		throw new Error(
			`Failed to fetch docs: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`
		);
	}
}
