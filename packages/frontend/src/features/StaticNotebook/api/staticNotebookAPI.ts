import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import DOMPurify from 'isomorphic-dompurify';
import { isArray } from 'lodash';
import { GEN3_STATIC_NOTEBOOK_DIR } from '../constants';

export const staticNotebookAPI = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Only GET requests are allowed' });
    }
    // Validate that a notebook was provided
    const { notebook } = req.query;
    if (!notebook) {
      return res.status(400).json({ error: 'notebook parameter is required' });
    }
    let filePath: string = '';
    if (isArray(notebook)) {
      filePath = notebook[0];
    } else {
      filePath = notebook as string;
    }

    // Security: Prevent directory traversal attacks
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');

    // Ensure the file is within the allowed directory and has .html extension
    if (!sanitizedPath.endsWith('.html')) {
      return Response.json(
        {
          error: 'Only HTML files are allowed',
          success: false,
        },
        { status: 400 },
      );
    }

    // Construct the full file path within the data directory
    const fullPath = path.join(
      process.cwd(),
      GEN3_STATIC_NOTEBOOK_DIR,
      sanitizedPath,
    );

    // Check if a file exists and is within the data directory

    const dataDir = path.join(process.cwd(), GEN3_STATIC_NOTEBOOK_DIR);
    console.log('dataDir', dataDir);
    if (!fullPath.startsWith(dataDir)) {
      return res.status(403).json({
        error: 'File access denied',
        success: false,
      });
    }

    const rawContent = fs.readFileSync(fullPath, 'utf8');

    const sanitizedContent = DOMPurify.sanitize(
      rawContent,
      /*{
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


    } */
    );

    res.status(200).json({
      content: rawContent,
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
};

export default staticNotebookAPI;
