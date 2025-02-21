#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

function loadJson(filePath: string) {
  try {
    const absolutePath = path.resolve(filePath);
    const data = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading file: ${filePath}`, error);
    process.exit(1);
  }
}

function validateJson(jsonFile: string, schemaFile: string) {
  const jsonData = loadJson(jsonFile);
  const schemaData = loadJson(schemaFile);

  const validate = ajv.compile(schemaData);
  const valid = validate(jsonData);

  if (valid) {
    console.log('✅ JSON is valid!');
    process.exit(0);
  } else {
    console.error('❌ JSON validation failed:');
    console.error(validate.errors);
    process.exit(1);
  }
}

function showUsage() {
  console.log('Usage:');
  console.log('  json-validator <json-file> <schema-file>');
  process.exit(1);
}

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  showUsage();
}

const [jsonFile, schemaFile] = args;
validateJson(jsonFile, schemaFile);
