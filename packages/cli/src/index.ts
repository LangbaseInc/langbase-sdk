#!/usr/bin/env node
import { auth } from './auth';
import { build } from './build';
import { deploy } from './deploy';
import { docsMcpServer } from './docs-mcp-server';
import { createPipe } from './pipe/create';
import { runPipe } from './pipe/run';
import { updatePipe } from './pipe/update';
import { listPipes } from './pipe/list';
import cli from './utils/cli';
import debugMode from './utils/debug-mode';
import cliInit from './utils/init';
import { createMemory } from './memory/create';
import { listMemories } from './memory/list';
import { deleteMemory } from './memory/delete';
import { uploadDocs } from './memory/upload-docs';
import { embedDoc } from './memory/embed-doc';
import { retriveFromMemory } from './memory/retrive';
import { listDocs } from './memory/list-docs';
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

	if (command('pipe') && !flag('run') && !flag('update') && !flag('listPipes')) {
		await createPipe();
	}

	if (command('pipe') && flag('run')) {
		await runPipe();
	}

	if (command('pipe') && flag('update')) {
		await updatePipe();
	}

	if (command('pipe') && flag('listPipes')) {
		await listPipes();
	}


	if (command('memory') && !flag('upload') && !flag('embed') && !flag('retrieve') && !flag('listDocs') && !flag('delete') && !flag('listMemories')) {
		await createMemory();
	}

	if (command('memory') && flag('listMemories')) {
		await listMemories();
	}
	
	if (command('memory') && flag('delete')) {
		await deleteMemory();
	}

	if (command('memory') && flag('upload')) {
		await uploadDocs();
	}

	if (command('memory') && flag('embed')) {
		await embedDoc();
	}

	if (command('memory') && flag('retrieve')) {
		await retriveFromMemory();
	}

	if (command('memory') && flag('listDocs')) {
		await listDocs();
	}

})();
