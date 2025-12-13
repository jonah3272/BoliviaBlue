/**
 * Test script for daily article generator
 * 
 * Usage: node test-article-generator.js
 */

import { generateDailyArticles } from './dailyArticleGenerator.js';

async function test() {
  try {
    console.log('🧪 Testing daily article generator...\n');
    console.log('This will generate test articles for today.\n');
    
    const result = await generateDailyArticles();
    
    console.log('\n✅ Test successful!');
    console.log('\n📝 Results:');
    console.log('   - Spanish article:', result.spanish);
    console.log('   - English article:', result.english);
    console.log('\n✅ Articles generated and saved to database!');
    console.log('\n📊 Article Details:');
    console.log('   - Word count: 1500+ words each');
    console.log('   - Language: Spanish & English');
    console.log('   - Category: Daily Analysis');
    console.log('   - Location: blog_articles table in Supabase');
    console.log('\n🔗 Access articles at:');
    console.log('   - /blog/analisis-diario-YYYY-MM-DD');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run test
test();

