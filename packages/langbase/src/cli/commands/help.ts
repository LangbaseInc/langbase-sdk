import {Command} from 'commander';

export function helpCommand(program: Command) {
	program
		.command('help')
		.description('display help information')
		.action(() => {
			program.help();
		});
}
