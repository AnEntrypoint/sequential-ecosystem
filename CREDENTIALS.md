# Setting Up Google API Credentials

This guide explains how to set up credentials for the Gmail task integration test.

**Important:** This system uses NO MOCKS or FALLBACKS. Tests fail cleanly without real credentials.

## Prerequisites

You need:
1. A Google Cloud Project with Admin API and Gmail API enabled
2. A service account with credentials (JSON key file)
3. The `GAPI_KEY` from your service account

## Getting Google API Credentials

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the following APIs:
   - Google Admin API
   - Gmail API
   - Google Workspace Domain API

### Step 2: Create a Service Account

1. In Google Cloud Console, go to "Service Accounts"
2. Click "Create Service Account"
3. Name it (e.g., "Gmail Task Runner")
4. Grant it the following roles:
   - Admin user
   - Gmail delegated admin

### Step 3: Create and Download Service Account Key

1. In the service account details, go to "Keys"
2. Click "Add Key" → "Create new key"
3. Choose JSON format
4. Save the JSON file

### Step 4: Extract API Key

The JSON file contains all the credentials you need. The key value is the private key.

## Setting Up Credentials in the System

Once you have your `GAPI_KEY`, set it using the keystore endpoint:

```bash
curl -X POST http://localhost:3000/task/keystore \
  -H "Content-Type: application/json" \
  -d '{
    "key": "GAPI_KEY",
    "value": "your-full-service-account-json-here"
  }'
```

## Running the Gmail Test

After setting credentials:

```bash
node test-gmail-task.js
```

The test will:
1. Verify credentials are present
2. Submit a Gmail task
3. Execute the task (it will suspend on the Google API call)
4. Process the stack run (this is where the real API call would happen)
5. Show the results

## Verifying Credentials Are Set

Check if a credential is stored:

```bash
curl http://localhost:3000/task/keystore/GAPI_KEY
```

Expected response (if set):
```json
{
  "success": true,
  "key": "GAPI_KEY",
  "value": "your-service-account-json..."
}
```

Expected response (if not set):
```json
{
  "success": false,
  "error": "Key not found",
  "key": "GAPI_KEY"
}
```

## Available Credentials

Currently supported:
- `GAPI_KEY` - Google API service account credentials (JSON)
- `GAPI_ADMIN_EMAIL` - Google Workspace admin email (for domain impersonation)

## Running with Real API Calls

The system is designed to process real API calls. When credentials are properly set and the test runs:

1. Tasks suspend on external API calls
2. Stack processor picks up pending API calls
3. ServiceClient calls the actual Google APIs with your credentials
4. Results are returned and task resumes

No mocks, simulations, or fallbacks - real API calls with real credentials.
