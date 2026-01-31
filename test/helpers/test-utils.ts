/**
 * Test Utilities for E2E Tests
 *
 * This file contains shared utilities and helpers for all e2e tests.
 * Optimized for Claude Code workflows - easy to read, maintain, and extend.
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test result tracking
 */
export type TestResult = {
  name: string;
  passed: boolean;
  duration?: number;
  error?: string;
};

export class TestRunner {
  private results: TestResult[] = [];
  private currentTest: { name: string; startTime: number } | null = null;

  /**
   * Run a test and track results
   */
  async test(name: string, fn: () => Promise<void>): Promise<void> {
    this.currentTest = { name, startTime: Date.now() };
    console.log(`\n🧪 ${name}`);

    try {
      await fn();
      const duration = Date.now() - this.currentTest.startTime;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - this.currentTest.startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.results.push({ name, passed: false, duration, error: errorMsg });
      console.log(`❌ FAILED (${duration}ms)`);
      console.log(`   Error: ${errorMsg}`);
    } finally {
      this.currentTest = null;
    }
  }

  /**
   * Print summary and exit with appropriate code
   */
  summarize(): void {
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce(
      (sum, r) => sum + (r.duration || 0),
      0,
    );

    console.log(`\nTotal: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed tests:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  - ${r.name}`);
          console.log(`    ${r.error}`);
        });
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  }

  /**
   * Get all results (for programmatic access)
   */
  getResults(): TestResult[] {
    return this.results;
  }
}

/**
 * Environment variable validation
 */
export function checkEnvironmentVariables(): void {
  console.log('Environment Variables:');
  console.log(
    '  AMPERSAND_API_KEY:',
    process.env.AMPERSAND_API_KEY ? '✓ SET' : '✗ NOT SET',
  );
  console.log(
    '  AMPERSAND_PROJECT_ID:',
    process.env.AMPERSAND_PROJECT_ID || '✗ NOT SET',
  );
  console.log(
    '  AMPERSAND_GROUP_REF:',
    process.env.AMPERSAND_GROUP_REF || '✗ NOT SET',
  );
  console.log(
    '  OPENAI_API_KEY:',
    process.env.OPENAI_API_KEY ? '✓ SET' : '✗ NOT SET',
  );
  console.log();

  const required = [
    'AMPERSAND_API_KEY',
    'AMPERSAND_PROJECT_ID',
    'AMPERSAND_GROUP_REF',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

/**
 * Get environment variables with defaults
 */
export function getEnvConfig() {
  return {
    apiKey: process.env.AMPERSAND_API_KEY || '',
    projectId: process.env.AMPERSAND_PROJECT_ID || '',
    groupRef: process.env.AMPERSAND_GROUP_REF || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    provider: process.env.TEST_PROVIDER || 'salesforce',
  };
}

/**
 * Assert helper for test validation
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Deep equality check
 */
export function assertEquals<T>(
  actual: T,
  expected: T,
  message?: string,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      message ||
        `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

/**
 * Log helper for consistent formatting
 */
export const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  debug: (msg: string) => console.log(`🔍 ${msg}`),
};

/**
 * Wait helper for delays
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry helper for flaky operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        log.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await wait(delayMs);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
