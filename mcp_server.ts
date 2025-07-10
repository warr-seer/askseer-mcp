// Run with: npx tsx ./mcp_server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const mcpServer = new McpServer({
  name: "askseer-mcp",
  version: "1.0.0",
});

// Tool that uses LLM to evaluate a UI
mcpServer.registerTool(
  "evaluate",
  {
    description: "Evaluate a UI using an LLM",
    inputSchema: {
      image: z.string().describe("Base64 encoded image of the UI"),
    },
    outputSchema: {
      results: z.array(
        z.object({
          heuristic: z.string(),
          violated: z.boolean(),
          reason: z.string(),
          recommendation: z.string().optional(),
        })
      ),
    },
  },
  async ({ image }) => {
    const response = await mcpServer.server.createMessage({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a user experience researcher. You have been tasked with evaluating a user interface (UI) against established a set of heuristics. Your objective is to identify any heuristic that are violated and provide actionable, user-centered recommendations for improvement.

            # Heuristics
            1. **Visibility of system status**: The system should always keep users informed about what is going on, through appropriate feedback within a reasonable time.
            2. **Match between system and the real world**: The system should speak the user's language, with words, phrases, and concepts familiar to the user, rather than system-oriented terms.
            3. **User control and freedom**: Users often choose system functions by mistake and will need a clearly marked "emergency exit" to leave the unwanted state without having to go through an extended dialogue.
            4. **Consistency and standards**: Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.
            5. **Error prevention**: Even better than good error messages is a careful design that prevents a problem from occurring in the first place.
            6. **Recognition rather than recall**: Minimize the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another.
            7. **Flexibility and efficiency of use**: Accelerators—unseen by the novice user—may often speed up the interaction for the expert user such that the system can cater to both inexperienced and experienced users.
            8. **Aesthetic and minimalist design**: Dialogues should not contain irrelevant or rarely needed information.
            9. **Help users recognize, diagnose, and recover from errors**: Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.
            10. **Help and documentation**: Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation. Any such information should be easy to search, focused on the user's task, list concrete steps to be carried out, and not be too large.

Please analyze the provided UI image and provide your evaluation.`,
          },
        },
        {
          role: "user",
          content: {
            type: "image",
            data: image,
            mimeType: "image/png",
          },
        },
      ],
      maxTokens: 1000,
    });

    // @ts-ignore
    const parsedResponse = JSON.parse(response.choices[0].message.content);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(parsedResponse, null, 2),
        },
      ],
      parsedResponse,
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.log("MCP server is running...");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
