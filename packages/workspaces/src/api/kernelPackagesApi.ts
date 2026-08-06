import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Fallback to crypto.randomUUID() if uuid is not installed
import WebSocket from 'ws';
import { JEG_SERVICE_API } from '../constants';
import { GEN3_FENCE_SERVICE } from '@gen3/core';
import { GEN3_FENCE_API } from '@gen3/core/server';
import type { NextApiRequest, NextApiResponse } from 'next';

const inCluster = Boolean(process.env.KUBERNETES_SERVICE_HOST);
const defaultGen3Endpoint = inCluster
  ? JEG_SERVICE_API
  : '/lw-workspace/proxy/jeg-panel';
const TOKEN = process.env.JUPYTERHUB_API_TOKEN || '';
const defaultFenceUrl = inCluster ? GEN3_FENCE_SERVICE : GEN3_FENCE_API;

const gen3Endpoint = process.env.JEG_SERVICE_API ?? defaultGen3Endpoint;
const fenceUrl = defaultFenceUrl;

/**
 * Python script executed on the kernel to extract installed packages cleanly.
 * Drops dependencies on external tools like pip or pkg_resources by using importlib.metadata (Python 3.8+).
 */
const PYTHON_PACKAGE_SCRIPT = `
import json
import sys

if sys.version_info >= (3, 8):
    from importlib.metadata import distributions
    pkgs = [{"name": d.metadata["Name"], "version": d.version} for d in distributions()]
else:
    import pkg_resources
    pkgs = [{"name": p.project_name, "version": p.version} for p in pkg_resources.working_set]

# Sort alphabetically by package name
pkgs = sorted(pkgs, key=lambda x: x["name"].lower())
print(json.dumps(pkgs))
`;

export async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { kernelId } = req.query;

  if (!kernelId) {
    return NextResponse.json(
      { error: 'Missing kernelId parameter' },
      { status: 400 },
    );
  }

  let kernelIdStr = '';
  if (Array.isArray(kernelId)) {
    kernelIdStr = kernelId[0];
  } else {
    kernelIdStr = kernelId;
  }

  try {
    const packagesJson = await executeCodeOnKernel(
      kernelIdStr,
      PYTHON_PACKAGE_SCRIPT,
    );
    const packagesArray = JSON.parse(packagesJson);
    return NextResponse.json(packagesArray);
  } catch (error: any) {
    console.error('Kernel execution failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract packages from kernel',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Orchestrates the Jupyter WebSocket execution lifecycle
 */
function executeCodeOnKernel(kernelId: string, code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Construct the standard Jupyter channels WebSocket URL
    // Format: ws://<host>:<port>/api/kernels/<kernel-id>/channels?token=<token>
    const wsUrl = `${gen3Endpoint}/api/kernels/${kernelId}/channels${
      TOKEN ? `?token=${TOKEN}` : ''
    }`;

    const ws = new WebSocket(wsUrl);

    const msgId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : uuidv4();
    const sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : uuidv4();

    // Setup an execution timeout boundary to protect the API route from hanging
    const timeout = setTimeout(() => {
      ws.terminate();
      reject(new Error('Kernel execution timed out after 15 seconds.'));
    }, 15000);

    ws.on('open', () => {
      // Construct the standard Jupyter execute_request message structure
      const executeRequest = {
        header: {
          msg_id: msgId,
          username: 'nextjs_app',
          session: sessionId,
          msg_type: 'execute_request',
          version: '5.3',
        },
        parent_header: {},
        metadata: {},
        content: {
          code: code,
          silent: false,
          store_history: false,
          user_expressions: {},
          allow_stdin: false,
          stop_on_error: true,
        },
        channel: 'shell',
      };

      ws.send(JSON.stringify(executeRequest));
    });

    let stdoutBuffer = '';

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        const { msg_type } = message.header;
        const parentMsgId = message.parent_header?.msg_id;

        // Verify this message is a direct response to our specific execution request
        if (parentMsgId !== msgId) return;

        // 1. Capture stdout streams from the iopub channel
        if (msg_type === 'stream' && message.content?.name === 'stdout') {
          stdoutBuffer += message.content.text;
        }

        // 2. Handle execution errors immediately
        if (msg_type === 'error') {
          clearTimeout(timeout);
          ws.close();
          reject(
            new Error(
              `Kernel Runtime Error: ${message.content.ename} - ${message.content.evalue}`,
            ),
          );
        }

        // 3. Resolve when the kernel returns to the idle state
        if (
          msg_type === 'status' &&
          message.content?.execution_state === 'idle'
        ) {
          clearTimeout(timeout);
          ws.close();

          if (!stdoutBuffer.trim()) {
            reject(
              new Error(
                'Kernel completed execution but returned no output data.',
              ),
            );
          } else {
            resolve(stdoutBuffer.trim());
          }
        }
      } catch (err) {
        clearTimeout(timeout);
        ws.close();
        reject(err);
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
