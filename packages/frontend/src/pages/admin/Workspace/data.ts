import fs from 'fs';
import path from 'path';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const GetWorkspaceNotebookData = async (ctx) => {
  const rootPath = `config/${GEN3_COMMONS_NAME}/`;
  const filepath = 'workspaceNotebooks.json';
  let data: Record<string, any> = {};
};
