import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import DOMPurify from 'isomorphic-dompurify'

export const  GET = async (request : NextRequest) =>  {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    // Validate that a path was provided
    if (!filePath) {
      return Response.json({
        error: 'File path is required. Use ?path=filename.html',
        success: false
      }, { status: 400 });
    }

    // Security: Prevent directory traversal attacks
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

    // Ensure the file is within the allowed directory and has .html extension
    if (!sanitizedPath.endsWith('.html')) {
      return Response.json({
        error: 'Only HTML files are allowed',
        success: false
      }, { status: 400 });
    }

    // Construct the full file path within the data directory
    const fullPath = path.join(process.cwd(), 'data', sanitizedPath);

    // Check if file exists and is within the data directory
    const dataDir = path.join(process.cwd(), 'data');
    if (!fullPath.startsWith(dataDir)) {
      return Response.json({
        error: 'File access denied',
        success: false
      }, { status: 403 });
    }

    const rawContent = fs.readFileSync(fullPath, 'utf8');

    const sanitizedContent = DOMPurify.sanitize(rawContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
      ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'target']
    });

    return Response.json({
      content: sanitizedContent,
      success: true,
      filePath: sanitizedPath
    });

  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return Response.json({
          error: 'File not found',
          success: false
        }, { status: 404 });
      }

    console.error('Error reading or sanitizing HTML file:', error);
    return Response.json({
      error: 'Failed to load content',
      success: false
    }, { status: 500 });
  }
}