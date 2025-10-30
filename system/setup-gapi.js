#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const gapiTaskTemplate = `/**
 * Comprehensive Gmail Search across all Google Workspace domains and users
 *
 * @param {Object} input
 * @param {string} [input.gmailSearchQuery=""] - Gmail search query
 * @param {number} [input.maxResultsPerUser=3] - Maximum email results per user
 * @param {number} [input.maxUsersPerDomain=5] - Maximum users to process per domain
 * @returns {Object} Comprehensive search results with domain breakdown
 */
module.exports = async function({ gmailSearchQuery = "", maxResultsPerUser = 10, maxUsersPerDomain = 500 }) {
  // Enforce Google API limits
  maxUsersPerDomain = Math.min(Math.max(maxUsersPerDomain, 1), 500);
  maxResultsPerUser = Math.min(Math.max(maxResultsPerUser, 1), 100);
  
  console.log('🚀 Starting comprehensive Gmail search');
  console.log('📧 Search Query: "' + gmailSearchQuery + '"');

  try {
    // Step 1: Discover all Google Workspace domains
    const domainsResponse = await fetch('http://localhost:3000/tools/gapi-domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (!domainsResponse.ok) {
      throw new Error('Failed to discover domains: ' + domainsResponse.statusText);
    }
    
    const { domains } = await domainsResponse.json();
    console.log('📊 Found ' + domains.length + ' domains');

    // Step 2: Process each domain
    const allResults = [];
    
    for (const domain of domains) {
      console.log('🏢 Processing domain: ' + domain);
      
      // Get users for this domain
      const usersResponse = await fetch('http://localhost:3000/tools/gapi-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain, 
          maxUsers: maxUsersPerDomain 
        })
      });
      
      if (!usersResponse.ok) {
        console.warn('⚠️  Failed to get users for domain ' + domain);
        continue;
      }
      
      const { users } = await usersResponse.json();
      console.log('👥 Found ' + users.length + ' users in ' + domain);

      // Step 3: Search Gmail for each user
      for (const user of users) {
        console.log('🔍 Searching Gmail for: ' + user.email);
        
        const gmailResponse = await fetch('http://localhost:3000/tools/gapi-gmail-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            query: gmailSearchQuery,
            maxResults: maxResultsPerUser
          })
        });
        
        if (!gmailResponse.ok) {
          console.warn('⚠️  Gmail search failed for ' + user.email);
          continue;
        }
        
        const gmailResults = await gmailResponse.json();
        
        allResults.push({
          domain,
          user: user.email,
          results: gmailResults.messages || [],
          totalResults: gmailResults.resultSizeEstimate || 0
        });
        
        console.log('📧 Found ' + (gmailResults.resultSizeEstimate || 0) + ' emails for ' + user.email);
      }
    }

    const totalEmails = allResults.reduce((sum, result) => sum + result.totalResults, 0);
    
    console.log('✅ Gmail search completed successfully');
    console.log('📊 Total emails found: ' + totalEmails);

    return {
      success: true,
      summary: {
        totalEmails,
        totalDomains: domains.length,
        totalUsers: allResults.length,
        searchQuery: gmailSearchQuery
      },
      domains: domains,
      results: allResults
    };

  } catch (error) {
    console.error('❌ Gmail search failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};`;

async function setupGapi() {
  console.log(chalk.blue('🔧 Setting up GAPI task...'));
  
  // Create service account directory
  const serviceAccountDir = '/mnt/c/dev/smtp';
  if (!fs.existsSync(serviceAccountDir)) {
    fs.mkdirSync(serviceAccountDir, { recursive: true });
  }
  
  // Create placeholder service account key
  const serviceAccountKeyPath = path.join(serviceAccountDir, 'service-account-key.json');
  if (!fs.existsSync(serviceAccountKeyPath)) {
    const placeholderKey = {
      "type": "service_account",
      "project_id": "your-project-id"
    };
    
    fs.writeFileSync(serviceAccountKeyPath, JSON.stringify(placeholderKey, null, 2));
    console.log(chalk.yellow('⚠️  Created placeholder service account key:'), serviceAccountKeyPath);
    console.log(chalk.red('🚨 Replace with your actual Google Workspace service account key'));
  }
  
  // Create the GAPI task
  const tasksDir = path.join(process.cwd(), 'packages', 'tasker-sequential', 'taskcode', 'endpoints');
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }
  
  const gapiTaskFile = path.join(tasksDir, 'comprehensive-gmail-search.js');
  fs.writeFileSync(gapiTaskFile, gapiTaskTemplate);
  console.log(chalk.green('✅ GAPI task created:'), chalk.cyan(gapiTaskFile));
  
  console.log(chalk.blue('\n📋 Setup completed!'));
  console.log(chalk.cyan('1. Add your actual service account key to:'), serviceAccountKeyPath);
  console.log(chalk.cyan('2. Start: npx sequential-ecosystem start'));
  console.log(chalk.cyan('3. Call via POST to:'), '/tasks/comprehensive-gmail-search');
}

export { setupGapi };