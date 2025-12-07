export function apiReferenceSection() {
  return `## Part 8: API Reference

### Tasks API

**List Tasks**
\`\`\`bash
GET /api/tasks
\`\`\`

**Execute Task**
\`\`\`bash
POST /api/tasks/:taskName/run
{
  "input": { "userId": 123 }
}
\`\`\`

**Get Task History**
\`\`\`bash
GET /api/tasks/:taskName/history
\`\`\`

**Get Task Status**
\`\`\`bash
GET /api/tasks/:taskName/runs/:runId
\`\`\`

### Flows API

**Get Flow Definition**
\`\`\`bash
GET /api/flows/:flowId
\`\`\`

**Execute Flow**
\`\`\`bash
POST /api/flows/:flowId/execute
{
  "input": { ... }
}
\`\`\`

### Tools API

**List All Tools**
\`\`\`bash
GET /api/tools
\`\`\`

**Search Tools**
\`\`\`bash
GET /api/tools/search?q=database
\`\`\`

**Get Tools by App**
\`\`\`bash
GET /api/tools/app/:appId
\`\`\`

**Execute Tool**
\`\`\`bash
POST /api/tools/app/:appId/:toolName
{
  "input": { ... }
}
\`\`\`

### Storage API

**Get Value**
\`\`\`bash
GET /api/storage/:path
\`\`\`

**Set Value**
\`\`\`bash
POST /api/storage/:path
{
  "value": { ... }
}
\`\`\`

**Delete Value**
\`\`\`bash
DELETE /api/storage/:path
\`\`\`

### WebSocket API

**Connect**
\`\`\`bash
ws://localhost:3000/ws/realtime/:appId
\`\`\`

**Subscribe to Channel**
\`\`\`javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'updates'
}));
\`\`\`

**Broadcast Message**
\`\`\`javascript
ws.send(JSON.stringify({
  type: 'message',
  channel: 'updates',
  data: { ... }
}));
\`\`\`

---

## Part 9: CLI Commands

### Task Management

\`\`\`bash
npx sequential-ecosystem init              # Initialize project
npx sequential-ecosystem create-task NAME  # Create new task
npx sequential-ecosystem run TASK          # Execute task
npx sequential-ecosystem list              # List all tasks
npx sequential-ecosystem show TASK RUNID   # Show task run details
npx sequential-ecosystem logs TASK RUNID   # Show task logs
npx sequential-ecosystem delete TASK       # Delete task
\`\`\`

### Flow Management

\`\`\`bash
npx sequential-ecosystem create-flow NAME  # Create new flow
npx sequential-ecosystem run-flow FLOW     # Execute flow
npx sequential-ecosystem flows             # List all flows
\`\`\`

### Server Management

\`\`\`bash
npx sequential-ecosystem serve             # Start server
npx sequential-ecosystem gui               # Start GUI (http://localhost:3001)
npx sequential-ecosystem health            # Check server health
\`\`\`

### Options

\`\`\`bash
--input JSON                # Task input
--dry-run                  # Validate without executing
--verbose                  # Debug output
--port PORT                # Server port
--database URL             # Database URL
--watch                    # Watch for changes
\`\`\`

---

## Part 13: Examples

Run examples from ./tasks/:

\`\`\`bash
npx sequential-ecosystem run example-simple-flow --input '{}'
npx sequential-ecosystem run example-api-integration --input '{"url":"https://api.example.com"}'
npx sequential-ecosystem run example-batch-process --input '{"items":[1,2,3]}'
npx sequential-ecosystem run example-payment-flow --input '{"amount":100,"cardToken":"tok_123"}'
npx sequential-ecosystem run example-resumable-task --input '{"items":[1,2,3,4,5]}'
\`\`\`

---

Happy building! 🚀

**Quick Links:**
- GUI: http://localhost:3001
- API: http://localhost:3000
- Docs: Read all CLAUDE.md / README.md files
- Examples: ./tasks/ directory

`;
}
