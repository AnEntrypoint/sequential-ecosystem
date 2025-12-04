export class SequentialOSClient {
  constructor(baseUrl = '/api/sequential-os') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Request failed: ${response.status} ${error}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  async getStatus() {
    return await this.request('/status');
  }

  async getHistory() {
    return await this.request('/history');
  }

  async getTags() {
    return await this.request('/tags');
  }

  async runCommand(instruction) {
    return await this.request('/run', {
      method: 'POST',
      body: JSON.stringify({instruction})
    });
  }

  async checkout(ref) {
    return await this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify({ref})
    });
  }

  async createTag(name, ref) {
    return await this.request('/tags', {
      method: 'POST',
      body: JSON.stringify({name, ref})
    });
  }

  async inspect(ref) {
    return await this.request(`/inspect/${ref}`);
  }

  async diff(ref1, ref2) {
    return await this.request(`/diff/${ref1}/${ref2}`);
  }

  async rebuild() {
    return await this.request('/rebuild', {
      method: 'POST'
    });
  }

  async reset() {
    return await this.request('/reset', {
      method: 'POST'
    });
  }
}

export default SequentialOSClient;
