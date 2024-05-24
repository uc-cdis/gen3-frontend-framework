import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { Center, Text  } from '@mantine/core';


const DataDictionaryPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Center className="m-20 w-full"><Text size="2rem">Coming soon.</Text></Center>
    </NavPageLayout>
  );
};

export default DataDictionaryPage;
