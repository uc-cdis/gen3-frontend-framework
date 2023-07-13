import type { AppProps } from 'next/app';
import { Gen3Provider, TenStringArray } from '@gen3/frontend';
import colorTheme from '../../config/theme.json';
import icons from '../../config/icons/gen3.json';
import '../styles/globals.css';

const colors = Object.fromEntries(
  Object.entries(colorTheme).map(([key, values]) => [
    key,
    Object.values(values) as TenStringArray,
  ]),
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Gen3Provider colors={colors} icons={icons}>
      <Component {...pageProps} />
    </Gen3Provider>
  );
}
