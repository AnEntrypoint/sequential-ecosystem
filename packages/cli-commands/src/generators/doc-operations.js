export function operationsSection() {
  return `## Part 6: Storage Backends

### Folder-Based Storage (Default)

Zero setup. Tasks stored in \`./tasks/\` directory:

\`\`\`bash
./tasks/
  my-task/
    code.js
    config.json
    runs/
      run-1.json
      run-2.json
\`\`\`

### SQLite Backend

Local database with no server needed:

\`\`\`bash
DATABASE_URL="sqlite://./tasks.db" npx sequential-ecosystem run my-task
\`\`\`

### Supabase Backend

Cloud-hosted PostgreSQL:

\`\`\`bash
DATABASE_URL="postgres://user:pass@host/db" npx sequential-ecosystem run my-task
\`\`\`

---

## Part 7: Visual Component Builder

### Component Editor

Build React components visually:

1. Click "New Component" in UI
2. Drag components onto canvas
3. Edit properties in sidebar
4. Export as JSX string

### Custom Components

Use custom React components in builder:

\`\`\`javascript
function CustomButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '10px 20px', fontSize: '16px' }}
    >
      {label}
    </button>
  );
}
\`\`\`

---

## Part 10: Deployment & Scaling

### Local Development

\`\`\`bash
npx sequential-ecosystem run my-task --input '{}'
npx sequential-ecosystem gui
\`\`\`

### Docker Deployment

\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
ENV DATABASE_URL=postgres://...
CMD ["npx", "sequential-ecosystem", "serve"]
\`\`\`

### Kubernetes

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sequential
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sequential
  template:
    metadata:
      labels:
        app: sequential
    spec:
      containers:
      - name: sequential
        image: sequential:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
\`\`\`

### Auto-Scaling

Use process manager for auto-restart:

\`\`\`bash
# Using PM2
pm2 start npx --name sequential -- sequential-ecosystem serve
pm2 restart sequential --watch
\`\`\`

---

## Part 11: Troubleshooting

### Task Won't Start

\`\`\`bash
npx sequential-ecosystem run my-task --dry-run --verbose
\`\`\`

### State Not Saving

Check folder permissions:

\`\`\`bash
ls -la ./tasks/my-task/
chmod -R 755 ./tasks/
\`\`\`

### Memory Leak

Configure StateManager limits:

\`\`\`bash
STATE_CACHE_SIZE=1000 STATE_TTL_MS=300000 npx sequential-ecosystem serve
\`\`\`

### Check Execution State

\`\`\`bash
npx sequential-ecosystem show my-task <run-id>
cat ./tasks/my-task/runs/run-*.json | jq .
\`\`\`

### Reset Storage

\`\`\`bash
rm -rf ./tasks/*/runs
DATABASE_URL="sqlite:./tasks.db" rm ./tasks.db
npx sequential-ecosystem init
\`\`\`

---

## Part 12: Best Practices

1. **Always use scope when writing files** - prevents data loss across runs
2. **Implement checkpointing** - resume from exact failure point
3. **Log to global scope** - audit trail across all executions
4. **Use exponential backoff** - for API calls to unreliable services
5. **Test with --dry-run** - validate before production deployment
6. **Monitor run history** - track success/failure patterns
7. **Validate input early** - fail fast with clear error messages
8. **Handle partial failures** - be idempotent where possible

`;
}
