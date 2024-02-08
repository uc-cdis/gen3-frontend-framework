import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import { convertUserYAMLToAuthz } from '../../../features/Authz';


export const AdminAuthZPageGetServerSideProps = async () => {

  const rootPath = `config/${GEN3_COMMONS_NAME}/`;
  const filepath = 'user.yaml';
  let data: Record<string, any> = {};

  try {
    const contents = fs.readFileSync(path.join(rootPath, filepath), 'utf8');
     data = await YAML.parse(contents);
  } catch (err) {
    throw new Error(`Cannot process ${rootPath}${filepath}`);
  }
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      // TODO: add support for helm and original user.yaml layout
      authz: convertUserYAMLToAuthz(data['fence']['USER_YAML']),
    },
  };
};
