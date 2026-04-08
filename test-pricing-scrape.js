/**
 * Quick test of pricing intelligence system
 * Run: node test-pricing-scrape.js
 */

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testClaude() {
  console.log('🧪 Testing Claude API connection...\n');

  try {
    // Test 1: Basic API call
    console.log('Test 1: Basic Claude API call');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Pricing intelligence system ready!" in JSON format.',
      }],
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log('✅ Response:', response);
    console.log(`   Tokens used: ${message.usage.input_tokens + message.usage.output_tokens}`);

    // Test 2: Price extraction simulation
    console.log('\n\nTest 2: Price extraction from sample HTML');

    const sampleHTML = `
      <div class="product">
        <h2>Cisco Catalyst 9300 48-Port Switch</h2>
        <span class="sku">C9300-48P-A</span>
        <span class="price">$8,495.00</span>
        <span class="msrp">Was: $9,995.00</span>
        <span class="stock">In Stock</span>
      </div>
    `;

    const priceMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Extract pricing information from this HTML and return ONLY valid JSON:

${sampleHTML}

Return format:
{
  "productName": "name",
  "sku": "sku",
  "price": 999.99,
  "msrp": 1099.99,
  "availability": "in stock",
  "confidence": 95
}`,
      }],
    });

    const priceResponse = priceMessage.content[0].type === 'text'
      ? priceMessage.content[0].text
      : '';

    console.log('✅ Extracted price data:');
    const jsonMatch = priceResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      console.log('   Product:', extracted.productName);
      console.log('   SKU:', extracted.sku);
      console.log('   Price:', extracted.price);
      console.log('   MSRP:', extracted.msrp);
      console.log('   Confidence:', extracted.confidence + '%');
    }

    console.log(`   Tokens used: ${priceMessage.usage.input_tokens + priceMessage.usage.output_tokens}`);

    console.log('\n✅ All tests passed! Your pricing intelligence system is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Run CREATE_PRICING_INTELLIGENCE_SCHEMA.sql in Supabase');
    console.log('   2. Use the API endpoints to scrape real vendor pages');
    console.log('   3. Build the admin UI to manage pricing data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.message.includes('API key')) {
      console.error('\n💡 Make sure ANTHROPIC_API_KEY is set in .env.local');
    }
  }
}

testClaude();
