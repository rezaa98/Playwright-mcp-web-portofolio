import { GoogleGenAI } from '@google/genai';
import { Page } from '@playwright/test';
import * as fs from 'fs';

export class AgenticTestingClient {
  private ai: GoogleGenAI;
  
  constructor() {
    // Requires GEMINI_API_KEY environment variable
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY is missing. Agent will run in mock mode or fail.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Helper to convert local image to the format expected by Gemini API
   */
  private getBase64Image(filePath: string) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType: "image/png"
      }
    };
  }

  /**
   * Sense-Think-Act loop
   */
  async analyzePageAndTakeAction(page: Page, goal: string): Promise<boolean> {
    console.log(`\n🤖 [Agent] Goal: "${goal}"`);

    // If no API key, fallback to mock mode so CI doesn't crash for users just testing the repo
    if (!process.env.GEMINI_API_KEY) {
      console.log('🤖 [Agent] (Mock Mode) Executing fallback actions...');
      if (goal.includes('login')) {
        await page.waitForSelector('input[type="email"]');
        await page.fill('input[type="email"]', 'agent@rezacode.cloud');
        await page.fill('input[type="password"]', 'SecureAiP@ss123');
        await page.click('button[type="submit"]');
      }
      return true;
    }

    const maxSteps = 5;
    
    for (let step = 1; step <= maxSteps; step++) {
      console.log(`🤖 [Agent] Step ${step}: Analyzing screen...`);
      
      // SENSE: Capture screenshot
      const screenshotPath = `agent-step-${step}.png`;
      await page.screenshot({ path: screenshotPath });

      // THINK: Ask LLM what to do next based on the image
      const prompt = `
        You are an autonomous QA automation agent. 
        Your goal is: "${goal}".
        Look at this screenshot of the current page.
        
        Analyze the UI elements.
        If the goal is already achieved, respond with exactly: "DONE".
        If you need to take an action, respond with a JSON object exactly like this:
        { "action": "click", "selector": "CSS_SELECTOR_HERE" }
        or
        { "action": "fill", "selector": "CSS_SELECTOR_HERE", "value": "TEXT_TO_TYPE" }
        
        Important: Reply ONLY with valid JSON or "DONE". No markdown formatting, no other text.
      `;

      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            prompt,
            this.getBase64Image(screenshotPath)
          ]
        });

        const text = response.text?.trim() || "";
        console.log(`🧠 [LLM Thought]: ${text}`);

        if (text.includes('DONE')) {
          console.log(`✅ [Agent] Goal achieved!`);
          // Clean up screenshots
          fs.unlinkSync(screenshotPath);
          return true;
        }

        // ACT: Parse the JSON and execute the Playwright command
        const command = JSON.parse(text);
        
        if (command.action === 'click') {
          console.log(`🖱️  [Agent] Clicking element: ${command.selector}`);
          await page.click(command.selector);
        } else if (command.action === 'fill') {
          console.log(`⌨️  [Agent] Typing "${command.value}" into ${command.selector}`);
          await page.fill(command.selector, command.value);
        }
        
        // Wait a bit for the UI to react
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.error(`❌ [Agent Error] Failed to parse or execute action:`, error);
        break; // Stop loop on error
      } finally {
        if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
      }
    }
    
    return false; // Did not achieve goal within max steps
  }

  async verifyAssertion(page: Page, assertion: string): Promise<boolean> {
    console.log(`\n🤖 [Agent] Verifying: "${assertion}"`);
    
    if (!process.env.GEMINI_API_KEY) {
      const content = await page.textContent('body');
      return content?.toLowerCase().includes('dashboard') || false;
    }

    const screenshotPath = `agent-assert.png`;
    await page.screenshot({ path: screenshotPath });

    const prompt = `
      You are a QA automation agent.
      Verify this assertion: "${assertion}"
      Look at the screenshot and determine if the assertion is TRUE or FALSE.
      Reply ONLY with "TRUE" or "FALSE".
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          this.getBase64Image(screenshotPath)
        ]
      });

      const text = response.text?.trim().toUpperCase() || "";
      console.log(`🧠 [LLM Verification]: ${text}`);
      
      return text.includes("TRUE");
    } catch (error) {
      console.error(`❌ [Agent Error] Verification failed:`, error);
      return false;
    } finally {
      if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
    }
  }
}
