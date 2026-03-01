import { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const router = Router();

// Store active transports
const transports = new Map<string, SSEServerTransport>();

router.get('/sse', async (req, res) => {
  const token = req.query.token as string;
  if (token !== process.env.WEBMCP_TOKEN) {
    res.status(401).send('Unauthorized');
    return;
  }

  const transport = new SSEServerTransport('/api/mcp/messages', res);
  const server = new McpServer({
    name: 'Partex WebMCP',
    version: '1.0.0',
  });

  server.tool(
    "get_server_status",
    "Get the current status of the Partex server",
    {}, 
    async () => {
        return {
            content: [{ type: "text", text: "Server is running" }]
        };
    }
  );

  transports.set(transport.sessionId, transport);

  transport.onclose = () => {
      transports.delete(transport.sessionId);
  };

  await server.connect(transport);
});

router.post('/messages', async (req, res) => {
  const token = req.query.token as string;
  if (token !== process.env.WEBMCP_TOKEN) {
     res.status(401).send('Unauthorized');
     return;
  }

  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
      res.status(400).send("Missing sessionId");
      return;
  }
  
  const transport = transports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(404).send('Session not found');
  }
});

export default router;
