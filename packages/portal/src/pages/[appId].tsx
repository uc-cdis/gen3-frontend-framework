import React from "react";
import { NextRouter, useRouter } from "next/dist/client/router";
import { GetStaticProps } from "next";
import { NavPageLayout, NavPageLayoutProps } from "@/components/Navigation";
import ContentSource from "@/lib/content";
import { getNavPageLayoutPropsFromConfig } from "@/lib/common/staticProps";
import {
  useCoreSelector,
  selectGen3AppMetadataById,
  selectGen3AppById,
  getGen3AppId,
  CoreState,
} from "@gen3/core";


type AppPageProps = NavPageLayoutProps ;

const getAppId = (router: NextRouter): string => {
  const { appId } = router.query;
  if (typeof appId === "string") return getGen3AppId(appId, "0.0.1");
  else if (typeof appId === "object") return getGen3AppId(appId[0], "0.0.1");

  return "UNKNOWN_APP_ID";
};

const AppPage = ({
                     headerProps,
                     footerProps,
                   }: AppPageProps) => {

  const router = useRouter();
  const appId = getAppId(router);
  const metadata = useCoreSelector((state : CoreState) =>
    selectGen3AppMetadataById(state, appId),
  );
  const Gen3App = useCoreSelector(() =>
    selectGen3AppById(appId),
  ) as React.ElementType;


  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <div className="flex flex-col content-center gap-y-4">
          {Gen3App && (
            <div>
              <Gen3App key={metadata.id} />
            </div>
          )}
        </div>
      </NavPageLayout>
    </div>
  );
};

export const getServerSideProps: GetStaticProps<NavPageLayoutProps> = async () => {
  const config = await ContentSource.get('config/siteConfig.json');

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default AppPage;
