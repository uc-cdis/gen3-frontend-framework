import { PropsWithChildren} from "react";
import { CoreProvider } from "@gen3/core";
import type { AppProps } from "next/app";
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import '../styles/globals.css';
import { addCollection } from '@iconify/react';
import icons from "../../config/icons/gen3.json"
import "@iconify/types";


const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
    addCollection(icons);
    return (
        <CoreProvider>
            <StyledEngineProvider injectFirst>
                <Component {...pageProps} />
            </StyledEngineProvider>
        </CoreProvider>
    );
};

export default PortalApp;
