import dotenv from "dotenv";
import { Langbase } from 'langbase';

dotenv.config();

// Initialize Langbase with your API key
const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!
});

// Router agent checks whether or not to use memory agent.
async function runRouterAgent(query) {
  const response = await langbase.pipes.run({
    stream: false,
    name: 'router-agent',
    model: 'openai:gpt-4o-mini', // Ensure this model supports JSON mode
    messages: [
      {
        role: 'system', // Update the content with your memory description
        content: `You are an expert query analyzer. Given a query, analyze whether it needs to use the memory agent or not.  
                  The memory agent contains a knowledge base that provides context-aware responses about AI, machine learning, 
                  and related topics. If the query is related to these topics, indicate that the memory agent should be used. 
                  Otherwise, indicate that it should not be used. 
                  Always respond in JSON format with the following structure: {"useMemory": true/false}.`
      },
      { role: 'user', content: query }
    ]
  });

  // Parse the response to determine if we should use the memory agent
  const parsedResponse = JSON.parse(response.completion);
  return parsedResponse.useMemory;
}

// Example usage
async function main() {
  const query = 'What is AI?';
  const useMemory = await runRouterAgent(query);
  console.log('Use Memory:', useMemory);

  if (useMemory) {
    // Run the memory agent
    const response = await langbase.pipes.run({
      stream: false,
      name: 'memory-agent', // Name of your memory agent
      messages: [
        { role: 'user', content: query }
      ]
    });
    console.log('Response from memory agent:', response);
  } else {
    // Run the non-memory agent
    const response = await langbase.pipes.run({
      stream: false,
      name: 'non-memory-agent', // Name of your non-memory agent
      messages: [
        { role: 'user', content: query }
      ]
    });
    console.log('Response from non-memory agent:', response);
  }
}

main();
