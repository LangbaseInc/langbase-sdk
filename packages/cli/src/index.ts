#!/usr/bin/env node
import { auth } from './auth';
import { build } from './build';
import { deploy } from './deploy';
import { docsMcpServer } from './docs-mcp-server';
import cli from './utils/cli';
import debugMode from './utils/debug-mode';
import cliInit from './utils/init';

const { flags, input, showHelp } = cli;
const { clear, debug } = flags;

// Utility function to check if a command is present
const command = (cmd: string): boolean => input.includes(cmd);

// Utility function to check if a flag is present
const flag = (flg: string): boolean => Boolean(flags[flg]);

(async () => {
	// Skip welcome message for docs-mcp-server command
	if (!command('docs-mcp-server')) {
		await cliInit({ clear });
	}
	if (debug) debugMode(cli);

	if (command('help')) {
		showHelp(0);
	}

	if (command('auth')) {
		await auth();
	}

	if (command('build')) {
		const filePath = flags.file;
		await build({ filePath });

		// await deploy({ isDev, agent, filePath, apiKey });
	}

	if (command('deploy')) {
		const isDev = flag('dev');
		const agent = flags.agent;
		const filePath = flags.file;
		const apiKey = flags.key;

		await deploy({ isDev, agent, filePath, apiKey });
	}

	if (command('docs-mcp-server')) {
		await docsMcpServer();
	}
})();
