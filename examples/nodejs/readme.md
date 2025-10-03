# Node.js Examples

Langbase Node.js examples for the Pipe API.

```sh
# Make sure to copy .env.example file and create .env file and add all the Pipe API keys in it
cp .env.example .env

# Then test any of the files or a script which runs these files.

# pipes
npm run pipe.run
npm run pipe.run.stream
npm run pipe.run.chat
npm run pipe.run.stream.chat
npm run pipe.run.stream.llmkey
npm run pipe.run.pipe.key
npm run pipe.list
npm run pipe.create
npm run pipe.update
npm run pipe.tool
npm run pipe.tool.stream

# memory
npm run memory.list
npm run memory.create
npm run memory.delete
npm run memory.retrieve

# docs
npm run memory.docs.list
npm run memory.docs.upload
npm run memory.docs.delete
npm run memory.docs.retry-embed

# tools
npm run tools.web-search
npm run tools.crawl

# chunk
npm run chunk

# embed
npm run embed

# parse
npm run parse

# threads
npm run thread.messages.add
npm run thread.messages.list
npm run thread.delete

# agent
npm run agent.run.mcp

# images
npm run images.openai
npm run images.google
npm run images.together
npm run images.openrouter
