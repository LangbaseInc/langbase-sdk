import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';

describe('Langbase Parser API - langbase.parse() / langbase.parser()', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	describe('parse() - Document Parsing', () => {
		it('should successfully parse a text document', async () => {
			const textContent = 'This is a test document with sample text content for parsing.';
			const buffer = Buffer.from(textContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'test-parse.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('documentName', 'test-parse.txt');
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result.content.length).toBeGreaterThan(0);
			expect(result.content).toContain('test document');
		}, 30000);

		it('should successfully parse a markdown document', async () => {
			const mdContent = `# Test Document

## Section 1
This is a test markdown document.

### Subsection
- Item 1
- Item 2
- Item 3

**Bold text** and *italic text*.

\`\`\`javascript
const hello = 'world';
\`\`\`
`;
			const buffer = Buffer.from(mdContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'test.md',
				contentType: 'text/markdown',
			});

			expect(result).toHaveProperty('documentName', 'test.md');
			expect(result).toHaveProperty('content');
			expect(result.content).toContain('Test Document');
			expect(result.content).toContain('Section 1');
		}, 30000);

		it('should successfully parse CSV content', async () => {
			const csvContent = `Name,Age,City,Occupation
Alice,30,New York,Engineer
Bob,25,San Francisco,Designer
Charlie,35,Boston,Manager
Diana,28,Seattle,Developer`;

			const buffer = Buffer.from(csvContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'test.csv',
				contentType: 'text/csv',
			});

			expect(result).toHaveProperty('documentName', 'test.csv');
			expect(result).toHaveProperty('content');
			expect(result.content).toContain('Alice');
			expect(result.content).toContain('Bob');
			expect(result.content).toContain('New York');
		}, 30000);

		it('should successfully parse a document with special characters', async () => {
			const specialContent = 'Document with special chars: @#$%^&*() and unicode: 你好 🌟';
			const buffer = Buffer.from(specialContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'special.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('content');
			expect(result.content).toContain('special chars');
		}, 30000);

		it('should successfully parse a long document', async () => {
			const longContent = `
# Artificial Intelligence: A Comprehensive Overview

## Introduction
Artificial Intelligence (AI) has become one of the most transformative technologies of our time.
This document explores various aspects of AI, from its foundations to modern applications.

## History of AI
The field of AI dates back to the 1950s when pioneers like Alan Turing and John McCarthy
laid the groundwork for machine intelligence.

## Machine Learning
Machine learning is a subset of AI that focuses on algorithms that can learn from data.
Key concepts include:
- Supervised Learning
- Unsupervised Learning
- Reinforcement Learning

## Deep Learning
Deep learning uses artificial neural networks with multiple layers to model complex patterns.
Popular architectures include:
1. Convolutional Neural Networks (CNNs)
2. Recurrent Neural Networks (RNNs)
3. Transformers

## Natural Language Processing
NLP enables machines to understand and generate human language.
Applications include chatbots, translation, and sentiment analysis.

## Computer Vision
Computer vision allows machines to interpret visual information.
Use cases include facial recognition, object detection, and image classification.

## AI Ethics
Important ethical considerations include:
- Bias and fairness
- Privacy concerns
- Accountability
- Transparency

## Future of AI
The future holds promise for AGI (Artificial General Intelligence) and continued
advancement in specialized AI applications.

## Conclusion
AI continues to evolve and shape our world in unprecedented ways.
			`.trim();

			const buffer = Buffer.from(longContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'long-doc.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('content');
			expect(result.content.length).toBeGreaterThan(500);
			expect(result.content).toContain('Artificial Intelligence');
		}, 30000);

		it('should successfully parse an empty document', async () => {
			const emptyContent = '';
			const buffer = Buffer.from(emptyContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'empty.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('documentName', 'empty.txt');
			expect(result).toHaveProperty('content');
		}, 30000);
	});

	describe('parser() - Alias Method', () => {
		it('should work identically to parse() method', async () => {
			const content = 'Test content for parser alias method';
			const buffer = Buffer.from(content, 'utf-8');

			const result = await langbase.parser({
				document: buffer,
				documentName: 'alias-test.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('documentName', 'alias-test.txt');
			expect(result).toHaveProperty('content');
			expect(result.content).toContain('parser alias');
		}, 30000);

		it('should handle markdown with parser() alias', async () => {
			const mdContent = '# Alias Test\n\nTesting the **parser** alias.';
			const buffer = Buffer.from(mdContent, 'utf-8');

			const result = await langbase.parser({
				document: buffer,
				documentName: 'alias.md',
				contentType: 'text/markdown',
			});

			expect(result).toHaveProperty('content');
			expect(result.content).toContain('Alias Test');
		}, 30000);
	});

	describe('parse() - Different Content Types', () => {
		it('should handle text/plain content type', async () => {
			const buffer = Buffer.from('Plain text content', 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'plain.txt',
				contentType: 'text/plain',
			});

			expect(result.documentName).toBe('plain.txt');
		}, 30000);

		it('should handle text/markdown content type', async () => {
			const buffer = Buffer.from('# Markdown', 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'doc.md',
				contentType: 'text/markdown',
			});

			expect(result.documentName).toBe('doc.md');
		}, 30000);

		it('should handle text/csv content type', async () => {
			const buffer = Buffer.from('a,b,c\n1,2,3', 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'data.csv',
				contentType: 'text/csv',
			});

			expect(result.documentName).toBe('data.csv');
		}, 30000);
	});

	describe('parse() - Response Structure', () => {
		it('should return properly structured response', async () => {
			const buffer = Buffer.from('Test content', 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'structure-test.txt',
				contentType: 'text/plain',
			});

			// Validate response structure
			expect(result).toHaveProperty('documentName');
			expect(typeof result.documentName).toBe('string');

			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
		}, 30000);
	});

	describe('parse() - Real-world Document Examples', () => {
		it('should parse a code snippet document', async () => {
			const codeDoc = `
# JavaScript Functions

Here's a function example:

\`\`\`javascript
function greet(name) {
	return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

This function takes a name and returns a greeting.
			`.trim();

			const buffer = Buffer.from(codeDoc, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'code-example.md',
				contentType: 'text/markdown',
			});

			expect(result.content).toContain('JavaScript Functions');
			expect(result.content).toContain('greet');
		}, 30000);

		it('should parse a table in CSV format', async () => {
			const tableData = `Product,Price,Stock,Category
Laptop,999.99,50,Electronics
Mouse,29.99,200,Electronics
Desk,299.99,30,Furniture
Chair,199.99,45,Furniture`;

			const buffer = Buffer.from(tableData, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'products.csv',
				contentType: 'text/csv',
			});

			expect(result.content).toContain('Laptop');
			expect(result.content).toContain('Electronics');
			expect(result.content).toContain('Furniture');
		}, 30000);

		it('should parse a technical documentation document', async () => {
			const techDoc = `
# API Documentation

## Authentication
All API requests require authentication using Bearer tokens.

### Example Request
\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/data
\`\`\`

## Endpoints

### GET /users
Returns a list of users.

**Parameters:**
- limit (optional): Number of results to return
- offset (optional): Pagination offset

**Response:**
\`\`\`json
{
	"users": [...],
	"total": 100
}
\`\`\`
			`.trim();

			const buffer = Buffer.from(techDoc, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'api-docs.md',
				contentType: 'text/markdown',
			});

			expect(result.content).toContain('API Documentation');
			expect(result.content).toContain('Authentication');
			expect(result.content).toContain('Endpoints');
		}, 30000);
	});
});
