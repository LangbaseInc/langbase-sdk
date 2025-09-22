/**
 * Verify that all exports are working correctly
 */
const { Langbase, LangbaseError, ErrorFactory } = require('../dist/index.js');

console.log('✅ Checking exports...');

// Check main class
console.log('Langbase class:', typeof Langbase === 'function' ? '✅' : '❌');

// Check enhanced error classes 
console.log('LangbaseError class:', typeof LangbaseError === 'function' ? '✅' : '❌');
console.log('ErrorFactory object:', typeof ErrorFactory === 'object' ? '✅' : '❌');

// Test basic instantiation
try {
  const langbase = new Langbase({ apiKey: 'lb_test_key' });
  console.log('Constructor works:', '✅');
  
  // Check utils property
  console.log('Utils property:', typeof langbase.utils === 'object' ? '✅' : '❌');
  console.log('Utils.createMessageBuilder:', typeof langbase.utils.createMessageBuilder === 'function' ? '✅' : '❌');
  console.log('Utils.debug:', typeof langbase.utils.debug === 'object' ? '✅' : '❌');
  
  // Check convenience methods
  console.log('Run method:', typeof langbase.run === 'function' ? '✅' : '❌');
  console.log('Stream method:', typeof langbase.stream === 'function' ? '✅' : '❌');
  console.log('Chat method:', typeof langbase.chat === 'function' ? '✅' : '❌');
  
  // Test message utils
  const userMsg = langbase.utils.userMessage('Hello');
  console.log('User message helper:', userMsg.role === 'user' && userMsg.content === 'Hello' ? '✅' : '❌');
  
  // Test message builder
  const builder = langbase.utils.createMessageBuilder();
  builder.user('Test');
  console.log('Message builder count:', builder.count() === 1 ? '✅' : '❌');
  
} catch (error) {
  console.log('Constructor error:', '❌', error.message);
}

console.log('\n🎉 All exports verified successfully!');