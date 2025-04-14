import meowHelp from 'cli-meow-help';
// @ts-ignore
import meow from 'meow';

const flags = {
	clear: {
		type: `boolean`,
		default: false,
		desc: `Clear the console`
	},
	debug: {
		type: `boolean`,
		default: false,
		shortFlag: `d`,
		desc: `Print debug info`
	},
	run: {
		type: `boolean`,
		default: false,
		desc: `Run a pipe agent`
	},
	update: {
		type: `boolean`,
		default: false,
		desc: `Update a pipe agent`
	},
	listPipes: {
		type: `boolean`,
		default: false,
		desc: `List all pipe agents`
	},	
	listMemories: {
		type: `boolean`,
		default: false,
		desc: `List all memories`
	},
	upload: {
		type: `boolean`,
		default: false,
		desc: `Upload a document to memory`
	},
	retrieve: {
		type: `boolean`,
		default: false,
		desc: `Retrieve chunks from memory`
	},
	listDocs: {
		type: `boolean`,
		default: false,
		desc: `List all documents in memory`
	},
	embed: {
		type: `boolean`,
		default: false,
		desc: `Retry embedding of a document in a memory`
	},
	delete: {
		type: `boolean`,
		default: false,
		desc: `Delete a memory`
	}

	// agent: {
	// 	type: `string`,
	// 	shortFlag: `a`,
	// 	desc: `Agent to deploy the script into`
	// },
	// file: {
	// 	type: `string`,
	// 	shortFlag: `f`,
	// 	desc: `Script path to deploy`
	// },
	// key: {
	// 	type: `string`,
	// 	shortFlag: `k`,
	// 	desc: `Langbase API key`
	// }
};

const commands = {
	'pipe': {
		desc: `Create a pipe agent`,
		flags: {
			create: {
				type: `boolean`,
				default: false,
				desc: `Create a pipe agent`
			}
		}
	},
	'memory': {
		desc: `Create a memory`,
	},
	'docs-mcp-server': {
		desc: `Start the Langbase docs MCP server`
	},
	// auth: { desc: `Authenticate with Langbase` },
	// deploy: { desc: `Deploy a script to Langbase` },
	help: { desc: `Print help info` }
};

const helpText = meowHelp({
	name: `@langbase/cli`,
	flags,
	commands,
	desc: false,
	header: false,
	footer: `Made by Langbase. For more https://langbase.com/docs`
});

const options = {
	importMeta: import.meta,
	inferType: true,
	description: false,
	hardRejection: false,
	flags
};

export default meow(helpText, options);
