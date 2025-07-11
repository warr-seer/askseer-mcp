// Run with: npx tsx ./mcp_server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import puppeteer from "puppeteer";
import { z } from "zod";

// Create an MCP server
const mcpServer = new McpServer({
  name: "askseer-mcp",
  version: "1.0.0",
});

// Tool that uses LLM to evaluate a UI based on a set of heuristics
mcpServer.registerTool(
  "evaluate",
  {
    title: "Heuristic Evaluation",
    description:
      "A tool that uses LLM to evaluate a UI based on a set of heuristics",
    inputSchema: {
      url: z.string().url(),
    },
    // outputSchema: {
    //   results: z.array(
    //     z.object({
    //       heuristic: z.string(),
    //       violated: z.boolean(),
    //       reason: z.string(),
    //       recommendation: z.string().optional(),
    //     })
    //   ),
    // },
  },
  async ({ url }) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshotBase64 = (screenshotBuffer as Buffer).toString("base64");

      await browser.close();

      const response = await mcpServer.server.createMessage({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are a user experience researcher. You have been tasked with evaluating a user interface (UI) against established heuristics. Your objective is to identify any heuristic that are violated and provide actionable, user-centered recommendations for improvement.

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

Please analyze the provided UI image and return your evaluation as a JSON array. Each element should be an object with the following structure:
{
  "heuristic": "name of the heuristic",
  "violated": true/false,
  "reason": "explanation of why this heuristic is or isn't violated",
  "recommendation": "actionable recommendation for improvement (optional, only if violated is true)"
}

Return only the JSON array, no additional text or formatting.`,
            },
          },
          {
            role: "user",
            content: {
              type: "image",
              data: screenshotBase64,
              mimeType: "image/png",
            },
          },
        ],
        maxTokens: 1000,
      });

      console.log("LLM response:", JSON.stringify(response.content, null, 2));

      return {
        content: [
          {
            type: "text",
            text:
              response.content.type === "text"
                ? response.content.text
                : `Unable to evaluate ${url}`,
          },
        ],
      };
    } catch (error) {
      console.error("Error loading page:", error);
      throw new Error(`Failed to evaluate: ${url}`);
    }
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
