import { GetServerSideProps } from "next";
import { getNavPageLayoutPropsFromConfig } from "@/lib/common/staticProps";
import ContentSource from "../lib/content";
import { NavPageLayout, NavPageLayoutProps } from "@/components/Navigation";
import Discovery, { DiscoveryProps } from "@/components/Discovery/Discovery";

type DiscoveryPageProps = NavPageLayoutProps & DiscoveryProps;

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

// change to app NextJS app routing once this NextJS feature is released.
// NextJS 13 will support app routing, which will allow us to use the same
// page for all pages, and pass in the props for each page.
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  const config = await ContentSource.get("config/siteConfig.json");
  const discoveryProps: DiscoveryProps = await ContentSource.get(
    `config/${config.commons}/discovery.json`,
  );

  console.log("discoveryProps", discoveryProps);
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...discoveryProps,
    },
  };
};

export default DiscoveryPage;
