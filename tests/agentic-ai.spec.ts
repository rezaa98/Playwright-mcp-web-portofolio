import { test, expect } from '@playwright/test';
import { AgenticTestingClient } from '../src/agent';
import * as dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

test.describe('Agentic AI Testing Demo', () => {
  test('Agent can autonomously navigate and login', async ({ page }) => {
    const aiAgent = new AgenticTestingClient();
    
    // 1. Give the agent a high-level goal instead of hardcoded locators
    await page.goto('https://example.com/login'); // Using mock URL for demo
    
    console.log('--- Step 1: Navigating to App ---');
    // In a real demo, we'd navigate to a real app. 
    // Here we'll just mock the DOM so the test passes.
    await page.setContent(`
      <html>
        <body>
          <h1>Login</h1>
          <input type="email" id="email" />
          <input type="password" id="password" />
          <button type="submit" onclick="document.body.innerHTML='<h1>Dashboard</h1><p>Welcome back!</p>'">Sign In</button>
        </body>
      </html>
    `);

    // 2. Instruct the Agent to login
    await aiAgent.analyzePageAndTakeAction(page, "Fill in the login form with valid credentials and submit");

    // 3. Instruct the Agent to verify success
    const isSuccess = await aiAgent.verifyAssertion(page, "Ensure the user is redirected to the dashboard and sees a welcome message");
    
    // Capture screenshot of the process for README
    await page.screenshot({ path: 'testing-process.png' });
    
    expect(isSuccess).toBeTruthy();
    console.log('--- Test Completed Successfully ---');
  });
});
