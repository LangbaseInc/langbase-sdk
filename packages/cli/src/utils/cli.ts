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
	agent: {
		type: `string`,
		shortFlag: `a`,
		desc: `Agent to deploy the script into`
	},
	file: {
		type: `string`,
		shortFlag: `f`,
		desc: `Script path to deploy`
	},
	key: {
		type: `string`,
		shortFlag: `k`,
		desc: `Langbase API key`
	}
};

const commands = {
	auth: { desc: `Authenticate with Langbase` },
	deploy: { desc: `Deploy a script to Langbase` },
	help: { desc: `Print help info` },
};

const helpText = meowHelp({
	name: `langbase`,
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
