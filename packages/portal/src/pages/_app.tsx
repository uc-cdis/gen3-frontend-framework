import "../styles/globals.css";
import { CoreProvider } from "@gen3/core";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "../app/store";
import '../styles/globals.css';



const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
    return (
        <CoreProvider>
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        </CoreProvider>
    );
};

export default PortalApp;
