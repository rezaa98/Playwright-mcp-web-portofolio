# Playwright Agentic AI Testing

This repository demonstrates the integration of **Playwright** with the **Model Context Protocol (MCP)** to create an autonomous, Agentic AI-driven End-to-End (E2E) testing framework.

Unlike traditional automation where test scripts are hardcoded with specific DOM locators (`page.locator('#email').fill(...)`), this approach utilizes an AI agent to interpret high-level natural language goals and autonomously execute actions on the browser.

## Key Features

- 🤖 **Agentic Automation:** Pass natural language instructions (e.g., "Login with valid credentials") to the AI agent.
- 🎯 **Resilient Testing:** AI dynamically parses the DOM and infers locators, reducing test flakiness due to UI changes.
- ⚡ **Playwright Engine:** Uses the fast, reliable, and multi-browser capabilities of Playwright.
- 🔌 **Model Context Protocol (MCP):** Connects testing logic to large language models systematically.

## Testing Process Overview

When the test runs, the AI Agent:
1. Navigates to the required URL.
2. Analyzes the current DOM state to understand the context.
3. Takes autonomous action based on the high-level goal provided.
4. Verifies the page state against the expected assertion.

### Execution Screenshot

Below is an automated screenshot captured during the execution of the agentic test flow:

![Agentic Test Execution Screenshot](./testing-process.png)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Playwright browsers installed

### Installation

```bash
git clone https://github.com/rezaa98/Playwright-mcp-web-portofolio.git
cd Playwright-mcp-web-portofolio
npm install
```

### Enabling Real Agentic AI (Google Gemini)

By default, if no API key is provided, the agent runs in **Mock Mode** so tests still pass in CI/CD without burning credits.

To enable the real **Vision-based Sense-Think-Act loop**:
1. Copy the example env file: `cp .env.example .env`
2. Get an API key from [Google AI Studio](https://aistudio.google.com/).
3. Add your key to `.env`: `GEMINI_API_KEY=your_key_here`

When the key is present, the Agent will literally take screenshots of the Chromium browser, send them to Gemini 1.5 Flash, and ask the model to predict the CSS selectors and actions needed to achieve your goal autonomously!

### Running the Tests

To run the agentic tests in headless mode:
```bash
npm test
```

To run the tests with the Playwright UI mode:
```bash
npm run test:ui
```

---
*Created as part of the Web Demo automation showcase for Reza Yusuf Maulana.*
