import '@jbrowse/react-linear-genome-view/esm/workerPolyfill';
import { initializeWorker } from '@jbrowse/product-core';
import { enableStaticRendering } from 'mobx-react';
// locals
import corePlugins from '@jbrowse/react-linear-genome-view/esm/corePlugins';
// static rendering is used for "SSR" style rendering which is done on the
// worker
enableStaticRendering(true);

class MyPlugin {
  name = 'MyPlugin';
  install() {
    console.log('myPlugin');
  }
  configure() {}
}
initializeWorker([...corePlugins, MyPlugin], {
  fetchESM: (url) => import(/* webpackIgnore:true */ url),
});

export default function doNothing() {
  /* do nothing */
}
