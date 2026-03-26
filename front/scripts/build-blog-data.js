#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '..', 'public', 'blog', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'blogData.json');

function scanDirectory(dir, basePath = '') {
  const items = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const categoryPath = path.join(basePath, entry.name);
        items.push(...scanDirectory(fullPath, categoryPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const category = basePath || 'uncategorized';
        items.push({
          filename: entry.name,
          category: category,
          fullPath: fullPath
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return items;
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateExcerpt(content, maxLength = 160) {
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\$\$(.*?)\$\$/g, '[Math]')
    .replace(/\$(.*?)\$/g, '[Math]')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function processMarkdownFile(filePath, category, filename) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    const slug = filename.replace('.md', '');
    const readingTime = calculateReadingTime(parsed.content);
    const excerpt = parsed.data.excerpt || generateExcerpt(parsed.content);
    
    return {
      ...parsed.data,
      content: parsed.content,
      slug,
      category,
      readingTime,
      excerpt,
      date: parsed.data.date || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

function buildBlogData() {
  console.log('Building blog data...');
  
  if (!fs.existsSync(BLOG_DIR)) {
    console.warn('Blog posts directory not found:', BLOG_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ posts: [], lastUpdated: new Date().toISOString() }, null, 2));
    return;
  }

  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const postFiles = scanDirectory(BLOG_DIR);
  const posts = [];

  for (const postInfo of postFiles) {
    const postData = processMarkdownFile(postInfo.fullPath, postInfo.category, postInfo.filename);
    
    if (postData && postData.title && postData.date) {
      posts.push(postData);
    } else {
      console.warn(`Skipping post ${postInfo.filename} - missing required fields`);
    }
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const blogData = {
    posts,
    lastUpdated: new Date().toISOString(),
    totalPosts: posts.length
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogData, null, 2));
  console.log(`[OK] Blog data written: ${posts.length} post(s) -> ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  
  const byCategory = {};
  posts.forEach(post => {
    if (!byCategory[post.category]) {
      byCategory[post.category] = [];
    }
    byCategory[post.category].push(post.title);
  });
  
  Object.entries(byCategory).forEach(([category, titles]) => {
    console.log(`  ${category}: ${titles.length} post(s)`);
  });
}

if (require.main === module) {
  buildBlogData();
}

module.exports = { buildBlogData };