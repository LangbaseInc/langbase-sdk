import path from 'path';
import fs from 'fs/promises';

export async function findEnvFile() {
	const envFiles = ['.env', '.env.local', '.dev.vars'];

	for (const file of envFiles) {
		try {
			const filePath = path.join(process.cwd(), file);
			await fs.access(filePath);
			return file; // Return the first file that exists
		} catch (error) {
			// File doesn't exist, continue to next file
			continue;
		}
	}

	return null; // Return null if no env file is found
}
