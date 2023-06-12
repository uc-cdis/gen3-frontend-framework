
import { NavPageLayout, NavPageLayoutProps } from '@/components/Navigation';
import Discovery, { DiscoveryProps } from '@/components/Discovery/Discovery';
import { DiscoveryPageProps } from '@/pages/Discovery/types';


const DiscoveryPage = ({
  headerProps,
  footerProps,
  columns,
  dataURL,
}: DiscoveryPageProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Discovery columns={columns} dataURL={dataURL} />
    </NavPageLayout>
  );
};


export default DiscoveryPage;
