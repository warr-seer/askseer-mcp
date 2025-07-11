# AskSeer MCP Server

A Model Context Protocol (MCP) server that provides UI evaluation capabilities using Puppeteer and LLM analysis.

## Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd askseer-mcp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure MCP client**

   Add this configuration to your MCP client's configuration file (e.g., Claude Desktop's `mcp.json`):

   ```json
   {
     "servers": {
       "askseer-mcp": {
         "command": "npx",
         "args": [
           "tsx",
           "/Users/andywarr/Documents/code/askseer-mcp/mcp_server.ts"
         ],
         "env": {
           "NODE_ENV": "development"
         }
       }
     }
   }
   ```

```json
{
  "servers": {
    "askseer-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "mcp_server.ts"],
      "cwd": "/path/to/your/askseer-mcp"
    }
  }
}
```

### Manual execution

You can also run the server manually for testing:

```bash
npm start
# or
npx tsx mcp_server.ts
```

## Available Tools

- `evaluate`: Evaluate a UI using an LLM by providing a URL

## Requirements

- Node.js (v16 or higher)
- npm or yarn
