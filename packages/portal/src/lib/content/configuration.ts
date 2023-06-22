import { Gen3CommonsConfiguration } from './types';
import fs from "fs";
import path from "path";

const loadConfig = async (rootPath: string): Promise<Gen3CommonsConfiguration> => {
  let config =  JSON.parse(fs.readFileSync(path.join(rootPath, "siteConfig.json")).toString('utf-8'));
  config.colors = JSON.parse(fs.readFileSync(path.join(rootPath, `${config.commons}`, 'colors.json')).toString('utf-8'));
  return config;
}
