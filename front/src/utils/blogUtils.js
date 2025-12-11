import { format, parseISO } from 'date-fns';
import blogData from '../data/blogData.json';

export const BLOG_CONFIG = {
  categories: {
    curiosities: {
      name: 'Mathematical Curiosities',
      description: 'Explorations of games, puzzles, and mathematical phenomena',
      color: 'blue',
      icon: 'Brain'
    },
    research: {
      name: 'Research Notes',
      description: 'Academic papers, studies, and research insights',
      color: 'indigo',
      icon: 'FileText'
    },
    'field-notes': {
      name: 'Field Notes',
      description: 'Practical guides and technical deep-dives from real-world ML/AI work',
      color: 'emerald',
      icon: 'Code2'
    }
  },
  postsPerPage: 6
};

export async function loadAllPosts() {
  try {
    return blogData.posts || [];
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

export async function getPostBySlug(category, slug) {
  try {
    const allPosts = await loadAllPosts();
    const post = allPosts.find(p => p.category === category && p.slug === slug);
    return post || null;
  } catch (error) {
    console.error(`Error loading post ${category}/${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(category) {
  try {
    const allPosts = await loadAllPosts();
    return allPosts.filter(post => post.category === category);
  } catch (error) {
    console.error(`Error loading posts for category ${category}:`, error);
    return [];
  }
}

export async function getPostsByTag(tag) {
  try {
    const allPosts = await loadAllPosts();
    return allPosts.filter(post => 
      post.tags && post.tags.some(postTag => 
        postTag.toLowerCase() === tag.toLowerCase()
      )
    );
  } catch (error) {
    console.error(`Error loading posts for tag ${tag}:`, error);
    return [];
  }
}

export async function getAllTags() {
  try {
    const allPosts = await loadAllPosts();
    const tagSet = new Set();
    
    allPosts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet).sort();
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
}

export function formatDate(dateString, formatStr = 'MMMM d, yyyy') {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Enhanced scroll function that centers the target element
export function scrollToElementCentered(elementId, options = {}) {
  const {
    offset = 0,
    navbarHeight = 80,
    behavior = 'smooth',
    updateURL = true,
    highlightElement = true
  } = options;
  
  const element = document.getElementById(elementId);
  if (!element) return false;
  
  const elementRect = element.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.pageYOffset;
  
  // Calculate the center position accounting for navbar and custom offset
  const viewportHeight = window.innerHeight;
  const elementHeight = elementRect.height;
  
  // Center the element in the viewport
  const targetScrollTop = absoluteElementTop 
    - (viewportHeight / 2) 
    + (elementHeight / 2) 
    - (navbarHeight / 2) 
    + offset;
  
  window.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior
  });
  
  // Add highlight effect if requested
  if (highlightElement) {
    setTimeout(() => {
      element.classList.add('toc-highlight');
      setTimeout(() => {
        element.classList.remove('toc-highlight');
      }, 2000);
    }, 500);
  }
  
  // Update the URL hash after scrolling if requested
  if (updateURL) {
    setTimeout(() => {
      window.history.pushState(null, null, `#${elementId}`);
    }, 500);
  }
  
  return true;
}