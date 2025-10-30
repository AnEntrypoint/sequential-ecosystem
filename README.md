# Sequential Ecosystem

A task execution system with automatic suspend/resume capabilities, built for modern Node.js environments.

## 🚀 Quick Start

### Installation via npx (Recommended)

```bash
npx sequential-ecosystem init
npx sequential-ecosystem start
```

### Local Development

```bash
# Clone and setup
git clone <repository>
cd sequential-ecosystem
npm install

# Start the system
npm run start
```

## 📚 Features

- **Automatic Suspend/Resume**: Tasks automatically pause on HTTP calls and resume when complete
- **HTTP-based Architecture**: All tools and tasks communicate via HTTP endpoints
- **Task Management**: Create, manage, and execute tasks dynamically
- **Tool Integration**: External services are integrated as HTTP-callable tools
- **State Management**: Automatic state saving and loading for long-running tasks

## 🛠️ Usage

### Starting the System

```bash
# Start with default port 3000
npx sequential-ecosystem start

# Start with custom port
npx sequential-ecosystem start --port 8080

# Enable debug logging
npx sequential-ecosystem start --debug
```

### Creating Tasks

```bash
# Create a new task
npx sequential-ecosystem create-task my-task

# Create with description
npx sequential-ecosystem create-task my-task --description "My custom task"
```

### Setting up GAPI Integration

```bash
# Set up Gmail search task
npx sequential-ecosystem setup-gapi

# Add your service account key to /mnt/c/dev/smtp/service-account-key.json
```

## 🌐 API Endpoints

Once the system is running, these endpoints are available:

### System Endpoints

- `GET /` - API information
- `GET /status` - System status

### Task Execution

- `POST /tasks/{task-name}` - Execute a specific task

Example:
```bash
curl -X POST http://localhost:3000/tasks/comprehensive-gmail-search \
  -H "Content-Type: application/json" \
  -d '{
    "gmailSearchQuery": "from:important",
    "maxResultsPerUser": 5,
    "maxUsersPerDomain": 10
  }'
```

### Tool Calls

- `POST /tools/{tool-name}` - Call external tools

## 📁 Project Structure

```
sequential-ecosystem/
├── cli.ts                    # Main CLI entry point
├── system/                   # System modules
│   ├── start.js             # System startup logic
│   ├── create-task.js       # Task creation utilities
│   └── setup-gapi.js        # GAPI setup utilities
├── packages/
│   ├── tasker-adaptor/      # Core task execution engine
│   ├── tasker-sequential/   # Sequential task runner
│   │   └── taskcode/
│   │       └── endpoints/   # Task definitions
│   └── tasker-wrapped-services/  # External service integrations
└── dist/                    # Built distribution files
```

## 🔄 How It Works

1. **Task Loading**: Tasks are automatically loaded from `packages/tasker-sequential/taskcode/endpoints/`
2. **HTTP Communication**: All external calls go through HTTP endpoints
3. **Automatic Pause/Resume**: When a task makes an HTTP call, it automatically:
   - Pauses execution
   - Saves current state
   - Makes the HTTP request
   - Resumes execution with results
4. **State Management**: Task state is preserved across HTTP calls

## 📝 Task Development

Tasks are simple JavaScript modules that export a function:

```javascript
module.exports = async function({ parameter1, parameter2 }) {
  console.log('🚀 Starting task');
  
  try {
    // Make HTTP call - automatically pauses/resumes
    const response = await fetch('http://localhost:3000/tools/some-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'value' })
    });
    
    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

## 🔧 GAPI Integration

The system includes a comprehensive Gmail search task:

1. **Setup**: Run `npx sequential-ecosystem setup-gapi`
2. **Configure**: Add your Google Workspace service account key to `/mnt/c/dev/smtp/service-account-key.json`
3. **Execute**: Call the task via HTTP POST to `/tasks/comprehensive-gmail-search`

## 🐛 Debugging

Enable debug mode:
```bash
npx sequential-ecosystem start --debug
```

Check system status:
```bash
curl http://localhost:3000/status
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🆘 Support

For issues and questions:
- Check the existing tasks in `packages/tasker-sequential/taskcode/endpoints/`
- Review the system logs when running with `--debug`
- Ensure all HTTP calls use the correct endpoint format
