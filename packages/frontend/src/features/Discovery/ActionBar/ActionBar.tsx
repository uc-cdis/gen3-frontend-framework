import React from 'react';
import { ExportToCart } from "../types";
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import DownloadManifestButton from './DownloadManifestButton';
import DownloadAsZipButton from './DownloadAsZipButton';
import CartActionButton from './CartActionButton';


interface ActionBarProps {
  config: ExportToCart;
}

const ActionBar = ({ config }: ActionBarProps) => {

  const selectedResources: Array<Record<string, any>> = []; // replace with cart resources

  const { buttons, manifestFieldName =  '__manifest', verifyExternalLogins } = config;

  return (
    <div className="flex items-center justify-end py-1 px-2 mb-1 w-full gap-x-1.5 ">
      {buttons.map((button, index) => {
        // if (button.type) {
        //   return {
        //     manifest: (
        //       <DownloadManifestButton
        //         selectedResources={selectedResources}
        //         manifestFieldName={manifestFieldName}
        //       />
        //     ),
        //     zip: <DownloadAsZipButton selectedResources={selectedResources} />,
        //     exportToWorkspace: <DownloadAsZipButton selectedResources={selectedResources} />,
        //
        //   }[button.type as string];
        //} else {
          return (
            <CartActionButton
              label={button.label}
              icon={DownloadIcon}
              toolTip={button.tooltip}
              loginRequired={config?.loginRequireForAllButtons ?? true}
              onClick={() => {
                console.log(`Download $[button.label]`);
              }}
              key={`action-button-${index}`}
            />
          );
       // }
      })}
    </div>
  );
};

export default ActionBar;
