/**
 * AdSense Content Audit Script
 * 
 * Verifies that all pages meet Google AdSense content requirements:
 * - Minimum 500 characters of meaningful text
 * - Minimum 3 meaningful content elements (sections, articles, etc.)
 * - Main content area with at least 200 characters
 * - useAdsenseReady() hook present
 * 
 * Run with: node scripts/audit-adsense-content.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIN_CONTENT_LENGTH = 500;
const MIN_MEANINGFUL_ELEMENTS = 3;
const MIN_MAIN_CONTENT = 200;

// Pages directory
const pagesDir = path.join(__dirname, '../src/pages');

// Get all page files
const pageFiles = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.jsx') && file !== 'Home.jsx') // Exclude Home.jsx as it's special
  .map(file => ({
    name: file,
    path: path.join(pagesDir, file)
  }));

console.log('🔍 AdSense Content Audit\n');
console.log('Requirements:');
console.log(`  - Minimum ${MIN_CONTENT_LENGTH} characters of text content`);
console.log(`  - Minimum ${MIN_MEANINGFUL_ELEMENTS} meaningful content elements`);
console.log(`  - Main content area with at least ${MIN_MAIN_CONTENT} characters`);
console.log(`  - useAdsenseReady() hook present\n`);
console.log('='.repeat(80) + '\n');

const results = [];

// Audit each page
for (const page of pageFiles) {
  const content = fs.readFileSync(page.path, 'utf-8');
  const pageName = page.name.replace('.jsx', '');
  
  // Check 1: Has useAdsenseReady hook
  const hasHook = content.includes('useAdsenseReady') || content.includes('useAdsenseReadyWhen');
  
  // Check 2: Count text content (approximate - count text in JSX strings)
  // Extract text from JSX strings and template literals
  const textMatches = content.match(/(?:['"`]|>)([^'"`<>{}\[\]]{10,})(?:['"`]|<)/g) || [];
  const textContent = textMatches
    .map(match => match.replace(/['"`><]/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const textLength = textContent.length;
  
  // Check 3: Count meaningful elements (sections, articles, divs with prose class, etc.)
  const sectionMatches = content.match(/<(section|article|main|div[^>]*class[^>]*prose)/gi) || [];
  const elementCount = sectionMatches.length;
  
  // Check 4: Has main element
  const hasMain = content.includes('<main') || content.includes('main className');
  
  // Check 5: Count paragraphs (approximate - look for <p> tags or text blocks)
  const paragraphMatches = content.match(/<p[^>]*>/gi) || [];
  const paragraphCount = paragraphMatches.length;
  
  // Check 6: Has substantial content sections (look for h2, h3, etc.)
  const headingMatches = content.match(/<h[2-6][^>]*>/gi) || [];
  const headingCount = headingMatches.length;
  
  // Determine status
  const passes = 
    hasHook &&
    textLength >= MIN_CONTENT_LENGTH &&
    elementCount >= MIN_MEANINGFUL_ELEMENTS &&
    hasMain &&
    paragraphCount >= 3;
  
  results.push({
    page: pageName,
    hasHook,
    textLength,
    elementCount,
    hasMain,
    paragraphCount,
    headingCount,
    passes
  });
}

// Print results
let passCount = 0;
let failCount = 0;

for (const result of results) {
  const status = result.passes ? '✅ PASS' : '❌ FAIL';
  const icon = result.passes ? '✅' : '❌';
  
  console.log(`${icon} ${result.page}`);
  console.log(`   Hook: ${result.hasHook ? '✅' : '❌'} ${result.hasHook ? 'Present' : 'MISSING'}`);
  console.log(`   Text: ${result.textLength >= MIN_CONTENT_LENGTH ? '✅' : '❌'} ${result.textLength}/${MIN_CONTENT_LENGTH} chars`);
  console.log(`   Elements: ${result.elementCount >= MIN_MEANINGFUL_ELEMENTS ? '✅' : '❌'} ${result.elementCount}/${MIN_MEANINGFUL_ELEMENTS}`);
  console.log(`   Main: ${result.hasMain ? '✅' : '❌'}`);
  console.log(`   Paragraphs: ${result.paragraphCount >= 3 ? '✅' : '❌'} ${result.paragraphCount}`);
  console.log(`   Headings: ${result.headingCount}`);
  console.log(`   Status: ${status}\n`);
  
  if (result.passes) {
    passCount++;
  } else {
    failCount++;
  }
}

// Summary
console.log('='.repeat(80));
console.log('\n📊 Summary:');
console.log(`   ✅ Passing: ${passCount}/${results.length}`);
console.log(`   ❌ Failing: ${failCount}/${results.length}`);

if (failCount > 0) {
  console.log('\n⚠️  Pages that need attention:');
  results
    .filter(r => !r.passes)
    .forEach(r => {
      const issues = [];
      if (!r.hasHook) issues.push('Missing useAdsenseReady hook');
      if (r.textLength < MIN_CONTENT_LENGTH) issues.push(`Low text content (${r.textLength}/${MIN_CONTENT_LENGTH})`);
      if (r.elementCount < MIN_MEANINGFUL_ELEMENTS) issues.push(`Few content elements (${r.elementCount}/${MIN_MEANINGFUL_ELEMENTS})`);
      if (!r.hasMain) issues.push('Missing <main> element');
      if (r.paragraphCount < 3) issues.push(`Few paragraphs (${r.paragraphCount})`);
      console.log(`   - ${r.page}: ${issues.join(', ')}`);
    });
  console.log('\n💡 Recommendation: Add more content to failing pages or ensure they have useAdsenseReady() hook.');
} else {
  console.log('\n🎉 All pages pass AdSense content requirements!');
}

console.log('\n');

