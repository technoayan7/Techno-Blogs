
import React from 'react';

// Helper function to create slugs from heading text
export function createSlugFromText(text) {
  if (typeof text !== 'string') {
    // Handle React elements or complex content
    text = React.Children.toArray(text).map(child =>
      typeof child === 'string' ? child : child.props?.children || ''
    ).join('');
  }

  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Utility function to extract headings from your blog content
export function extractHeadingsFromContent(content) {
  // This function should extract headings from your MDX content
  // The exact implementation depends on how you're processing your blog content

  // Example implementation for MDX content:
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[{}#]/g, '').trim();
    const id = createSlugFromText(text);

    headings.push({
      level,
      text,
      id,
      uid: id, // For React key
    });
  }

  return headings;
}

// Extract text content from React children
export function extractTextFromChildren(children) {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(child => extractTextFromChildren(child)).join('');
  }
  if (children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return children?.toString() || '';
}
