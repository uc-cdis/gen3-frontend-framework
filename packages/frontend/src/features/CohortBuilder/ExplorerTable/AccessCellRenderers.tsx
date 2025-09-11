import React from 'react';
import { CellRendererFunctionProps } from './types';
import { ExtractValueFromObject } from '@gen3/core';
import { Badge } from '@mantine/core';

interface ExtractedNames {
  programName: string | null;
  projectName: string | null;
}

// TODO: refine this to make more general
const extractProgramAndProjectNames = (path: string): ExtractedNames => {
  // Regular expression to match the pattern /programs/{programName}/projects/{projectName}
  const regex = /\/programs\/([^/]+)\/projects\/([^/]+)/;
  const match = path.match(regex);

  if (match) {
    return {
      programName: match[1],
      projectName: match[2],
    };
  }

  return {
    programName: null,
    projectName: null,
  };
};

interface StringToColorTable {
  [key: string]: string;
}

const isStringToColorTable = (value: unknown): value is StringToColorTable => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  for (const key in value) {
    if (
      typeof key !== 'string' ||
      typeof (value as Record<string, unknown>)[key] !== 'string'
    ) {
      return false;
    }
  }

  return true;
};

export const ProjectAccessCellRenderer = (
  { cell }: CellRendererFunctionProps,
  params: Record<string, any>,
) => {
  const value = cell.getValue();
  if (typeof value !== 'string') return <span>---</span>;
  const { projectName } = extractProgramAndProjectNames(value);

  let color = 'primary.4';
  if (params && isStringToColorTable(params?.colorTable)) {
    if (projectName) {
      color = ExtractValueFromObject(params.colorTable, projectName, color);
    }
  }

  return (
    <Badge fullWidth color={color}>
      {projectName}
    </Badge>
  );
};

export const OpenControlledAccessCellRenderer = (
  { cell }: CellRendererFunctionProps,
  params: Record<string, any>,
) => {
  const access = cell.getValue();
  if (typeof access !== 'string') return <span>Bad Value</span>;

  let color = 'primary.4';
  if (params && isStringToColorTable(params?.colorTable)) {
    if (access) {
      color = ExtractValueFromObject(params.colorTable, access, color);
    }
  }

  return (
    <Badge
      fullWidth
      color={color}
      className="w-full max-w-[8em] capitalize text-xs font-bold font-content"
    >
      {access}
    </Badge>
  );
};
