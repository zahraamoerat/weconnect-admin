const test = require('node:test');
const assert = require('node:assert/strict');

const { sendSupplierDecisionEmail } = require('./emailService');

test('sendSupplierDecisionEmail returns a safe no-op when SMTP is not configured', async () => {
  const result = await sendSupplierDecisionEmail({
    email: 'supplier@example.com',
    businessName: 'Example Co',
    status: 'Approved',
  });

  assert.equal(result.sent, false);
  assert.equal(result.reason, 'SMTP_NOT_CONFIGURED');
});
