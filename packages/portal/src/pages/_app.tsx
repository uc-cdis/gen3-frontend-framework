import { CoreProvider } from "@gen3/core";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { addCollection } from "@iconify/react";
import icons from "../../config/icons/gen3.json";
import "@iconify/types";
import React from "react";
import { coreStore, csrfApi } from "@gen3/core";

export const initStore = async () => {
  coreStore.dispatch(csrfApi.endpoints.getCSRF.initiate());
}

const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  addCollection(icons);
  initStore();
  return (
    <CoreProvider>
      <Component {...pageProps} />
    </CoreProvider>
  );
};

export default PortalApp;
