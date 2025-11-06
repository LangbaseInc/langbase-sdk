import {Command} from 'commander';
import {helpCommand} from './commands/help';

const pkg = require('../../package.json');

async function main() {
	const program = new Command();

	program
		.name('langbase')
		.description('Langbase CLI - Build serverless AI agents')
		.version(pkg.version, '-v, --version', 'output the current version')
		.helpOption('-h, --help', 'display help for command');

	// Register commands
	helpCommand(program);

	// Parse arguments
	await program.parseAsync(process.argv);
}

main().catch((error) => {
	console.error('Error:', error.message);
	process.exit(1);
});
