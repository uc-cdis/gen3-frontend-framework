import type { AppProps } from 'next/app';
import { GEN3_COMMONS_NAME} from "@gen3/core";
import { Gen3Provider, TenStringArray } from '@gen3/frontend';
import themeColors from '../../config/themeColors.json';
import themeFonts from '../../config/themeFonts.json';
import icons from '../../config/icons/gen3.json';
import '../styles/globals.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'graphiql/graphiql.css';
import '@graphiql/plugin-explorer/dist/style.css';
import '@graphiql/react/dist/style.css';


// TODO: THis must be done in a better way using newer NextJS features
import sessionConfig from '../../config/session.json';

const colors = Object.fromEntries(
  Object.entries(themeColors).map(([key, values]) => [
    key,
    Object.values(values) as TenStringArray,
  ]),
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Gen3Provider colors={colors} icons={icons} fonts={themeFonts} sessionConfig={sessionConfig.sessionConfig}>
      <Component {...pageProps} />
    </Gen3Provider>
  );
}
