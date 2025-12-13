export function generateFormAppExample() {
  return {
    name: 'Form App',
    description: 'Form submission with validation and processing',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Form App</title>
  <style>
    body { font-family: system-ui; max-width: 500px; margin: 0 auto; padding: 20px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: bold; }
    input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    textarea { resize: vertical; min-height: 120px; }
    button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; }
    button:hover { background: #0056b3; }
    .message { padding: 12px; border-radius: 4px; margin-top: 16px; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>📋 Feedback Form</h1>
  <form id="form">
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" required>
    </div>
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="category">Category:</label>
      <select id="category" required>
        <option>Bug Report</option>
        <option>Feature Request</option>
        <option>General Feedback</option>
      </select>
    </div>
    <div class="form-group">
      <label for="message">Message:</label>
      <textarea id="message" required></textarea>
    </div>
    <button type="submit">Submit Feedback</button>
  </form>
  <div id="response"></div>

  <script type="module">
    let sdk = null;

    async function initSDK() {
      const module = await import('/api/app-sdk.js');
      const { AppSDK } = module;
      sdk = new AppSDK({ appId: 'form-app' });
      await sdk.initStorage();
    }

    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        category: document.getElementById('category').value,
        message: document.getElementById('message').value
      };

      try {
        const result = await sdk.callTask('process-feedback', data);
        const response = document.getElementById('response');
        response.className = 'message success';
        response.textContent = 'Thank you! Your feedback has been submitted.';
        document.getElementById('form').reset();
      } catch (error) {
        const response = document.getElementById('response');
        response.className = 'message error';
        response.textContent = 'Error: ' + error.message;
      }
    });

    initSDK();
  </script>
</body>
</html>`
  };
}
