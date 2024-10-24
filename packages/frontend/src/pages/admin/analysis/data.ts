import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';

export const AnalysisEditorPageGetServerSideProps = async () => {
  // const rootPath = `config/${GEN3_COMMONS_NAME}/`;
  // const filepath = 'user.yaml';
  // let data: Record<string, any> = {};

  // try {
  //   // const contents = fs.readFileSync(path.join(rootPath, filepath), 'utf8');
  //  //  data = await YAML.parse(contents);
  // } catch (error: unknown) {
  //   if (error instanceof Error) {
  //     console.error(error.message);
  //   }
  //   throw new Error(`Cannot process ${rootPath}${filepath}`);
  // }
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
