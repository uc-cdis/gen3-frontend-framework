import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { Center, Text  } from '@mantine/core';


const DataDictionaryPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Center><Text size='xl'>Coming soon.</Text></Center>
    </NavPageLayout>
  );
};

export default DataDictionaryPage;
