/**
 * Simple test to verify SDK imports
 */

import { createRecord, updateRecord } from '@amp-labs/ai/aisdk';

console.log('Testing SDK imports...\n');
console.log('createRecord:', createRecord);
console.log('\nupdateRecord:', updateRecord);

if (createRecord) {
  console.log('\n✅ SDK imports working!');
  console.log('createRecord keys:', Object.keys(createRecord));
} else {
  console.log('\n❌ SDK imports failed - createRecord is undefined');
}
