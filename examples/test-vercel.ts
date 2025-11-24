import { handleCustomerQuery } from './vercel-agent';

async function main() {
  console.log('Testing Vercel Agent...\n');

  const result = await handleCustomerQuery('Hello, can you help me?');

  console.log('Classification:', result.classification);
  console.log('Response:', result.response);
}

main().catch(console.error);
