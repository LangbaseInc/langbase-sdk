import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";
import { findEnvFile } from "./find-env";

export async function getApiKey(): Promise<string> {
    const envFileName = await findEnvFile();
    if (!envFileName) {
        await auth();
        // After auth, try to find the env file again
        const newEnvFileName = await findEnvFile();
        if (!newEnvFileName) {
            console.error("Failed to find .env file after authentication");
            process.exit(1);
        }
        
        return getApiKey();
    }

        // Read the content of the env file
    const envFilePath = path.join(process.cwd(), envFileName);
    const envContent = await fs.readFile(envFilePath, 'utf-8');

    // Extract the API key from the env content
    const apiKeyMatch = envContent.match(/LANGBASE_API_KEY=([^\n]+)/);
    if (!apiKeyMatch) {	
        console.error("LANGBASE_API_KEY not found in .env file");
        process.exit(1);
    }

    const apiKey = apiKeyMatch[1];

    return apiKey;
}