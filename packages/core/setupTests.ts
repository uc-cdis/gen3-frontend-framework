import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    verbose: true,
  };
};

process.env.NEXT_PUBLIC_GEN3_COMMONS_NAME = 'gen3';
process.env.NEXT_PUBLIC_GEN3_API = 'https://gen3.localhost.io';
