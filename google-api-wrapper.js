#!/usr/bin/env node

/**
 * Google API wrapper for making authenticated calls to Google Admin and Gmail APIs
 * Uses service account credentials from keystore
 */

import fetch from 'node-fetch';

export class GoogleAPIWrapper {
  constructor(keyContent, adminEmail) {
    this.keyContent = keyContent;
    this.adminEmail = adminEmail;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token using service account credentials
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const key = typeof this.keyContent === 'string' ? JSON.parse(this.keyContent) : this.keyContent;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 hour

    // Create JWT
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: key.private_key_id
    };

    const payload = {
      iss: key.client_email,
      scope: [
        'https://www.googleapis.com/auth/admin.directory.domain.readonly',
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
        'https://www.googleapis.com/auth/gmail.readonly'
      ].join(' '),
      sub: this.adminEmail || key.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: expiry
    };

    const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    // Sign with private key
    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(key.private_key, 'base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const jwt = `${signatureInput}.${signature}`;

    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);

    return this.accessToken;
  }

  /**
   * Call Google API with authenticated request
   */
  async callAPI(apiPath, params = {}) {
    const token = await this.getAccessToken();

    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const url = `https://www.googleapis.com${apiPath}?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * List all domains in the organization
   */
  async listDomains(customerId = 'my_customer') {
    return this.callAPI('/admin/directory/v1/customers/' + customerId + '/domains');
  }

  /**
   * List users in a domain
   */
  async listUsers(customerId = 'my_customer', domain = null, maxResults = 500, pageToken = null) {
    const params = {
      customer: customerId,
      maxResults: Math.min(maxResults, 500),
      orderBy: 'email'
    };

    if (domain) {
      params.query = `orgUnitPath=/`;
      // Note: domain filtering via direct parameter not available in Admin API
      // Would need to filter results or use different query
    }

    if (pageToken) {
      params.pageToken = pageToken;
    }

    return this.callAPI('/admin/directory/v1/users', params);
  }

  /**
   * List messages in user's Gmail
   */
  async listMessages(userId, query = '', maxResults = 10, pageToken = null) {
    const params = {
      maxResults: Math.min(maxResults, 100),
      q: query
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    return this.callAPI(`/gmail/v1/users/${userId}/messages`, params);
  }

  /**
   * Get message details
   */
  async getMessage(userId, messageId) {
    return this.callAPI(`/gmail/v1/users/${userId}/messages/${messageId}`, {
      format: 'full'
    });
  }
}

export default GoogleAPIWrapper;
