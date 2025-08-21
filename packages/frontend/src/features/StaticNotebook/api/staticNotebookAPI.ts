import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import DOMPurify from 'isomorphic-dompurify';
import { isArray } from 'lodash';
import {
  GEN3_STATIC_NOTEBOOK_DIR,
  GEN3_STATIC_NOTEBOOK_PATH,
} from '../constants';

const MAX_FILE_SIZE = 4096 * 1024;

function safeReadFileSync(filePath: string, maxBytes = MAX_FILE_SIZE) {
  // 1 MB default
  const stats = fs.statSync(filePath);
  if (stats.size > maxBytes) {
    throw new Error(`File too large: ${stats.size} bytes (limit ${maxBytes})`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

export const staticNotebookAPI = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === 'OPTIONS') {
    res.status(200).json({
      success: true,
    });
    return;
  }

  if (req.method === 'GET') {
    try {
      // Validate that a notebook was provided
      const { notebook } = req.query;
      if (!notebook) {
        res.status(400).json({ error: 'notebook parameter is required' });
        return;
      }
      let filePath: string = '';
      if (isArray(notebook)) {
        filePath = notebook[0];
      } else {
        filePath = notebook as string;
      }

      // Security: Prevent directory traversal attacks
      const sanitizedPath = path
        .normalize(filePath)
        .replace(/^(\.\.[/\\])+/, '');

      // Ensure the file is within the allowed directory and has .html extension
      if (!sanitizedPath.endsWith('.html')) {
        res.status(400).json({
          error: 'Only HTML files are allowed',
          success: false,
        });
        return;
      }

      // Construct the full file path within the data directory
      const fullPath = path.join(
        process.cwd(),
        GEN3_STATIC_NOTEBOOK_DIR,
        sanitizedPath,
      );

      // Check if a file exists and is within the data directory

      const dataDir = path.join(
        process.cwd(),
        `${GEN3_STATIC_NOTEBOOK_PATH}/${GEN3_STATIC_NOTEBOOK_DIR}`,
      );
      if (!fullPath.startsWith(dataDir)) {
        res.status(403).json({
          error: 'File access denied',
          success: false,
        });
        return;
      }

      const rawContent = safeReadFileSync(fullPath);

      DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        if (node.tagName === 'a' || node.tagName === 'A') {
          // Check for anchor tags and target attribute
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener'); // Prevent window.opener vulnerability
        }
      });

      const sanitizedContent = DOMPurify.sanitize(rawContent, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'h1',
          'h2',
          'h3',
          'ul',
          'ol',
          'li',
          'a',
          'img',
        ],
        ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'target'],
      });

      res.status(200).json({
        content: sanitizedContent,
        success: true,
        filePath: sanitizedPath,
      });
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        res.status(404).json({
          error:
            'Notebook not found. Please check the notebook name and try again.',
          success: false,
        });
      } else {
        console.error('Error reading or sanitizing HTML file:', error);
        res.status(500).json({
          error: 'Error reading or sanitizing HTML file',
          success: false,
        });
      }
    }
  }
  res.status(405).json({ error: 'Only GET|OPTION requests are allowed' });
};

export default staticNotebookAPI;
