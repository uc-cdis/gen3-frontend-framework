import React, { useContext } from 'react';
import { CircleIcon, CloseIcon } from '../../types/icons';
import { SelectionScreenContext } from './context';
import { AnalysisToolConfiguration } from './types';

interface AnalysisBreadcrumbsProps {
  readonly registeredApps: AnalysisToolConfiguration[];
  readonly rightComponent: React.ReactNode;
  readonly onDemoApp: boolean;
  readonly skipSelectionScreen: boolean;
}

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-offset-2 focus:ring-offset-white rounded-md focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-focusColor';

const AnalysisBreadcrumbs: React.FC<AnalysisBreadcrumbsProps> = ({
  registeredApps,
  rightComponent,
  onDemoApp,
  skipSelectionScreen,
}: AnalysisBreadcrumbsProps) => {
  const { selectionScreenOpen, setSelectionScreenOpen, app, setActiveApp } =
    useContext(SelectionScreenContext);
  const appInfo = registeredApps.find((a) => a?.appId === app);

  const displayAdditionalSteps =
    !skipSelectionScreen && appInfo?.selectionScreen !== undefined;

  return (
    <nav
      aria-label="Analysis breadcrumb"
      className="w-full bg-primary px-4 py-2 flex items-center"
    >
      {' '}
      <button
        onClick={() => setActiveApp && setActiveApp(undefined)}
        className={`bg-base-max text-primary-content-darkest px-2 hover:bg-primary-darkest hover:text-primary-content-lightest rounded-md w-auto h-9 ${focusStyles}`}
        aria-label="Close app"
      >
        <CloseIcon size={20} aria-hidden="true" />
      </button>
      <span
        className={`p-2 mx-2 uppercase text-white ${
          !displayAdditionalSteps ? 'font-bold' : ''
        }`}
      >
        {onDemoApp ? `${appInfo?.title} Demo` : appInfo?.title}
      </span>
      {displayAdditionalSteps && (
        <>
          {appInfo?.selectionScreen !== undefined && (
            <>
              <CircleIcon size={8} color="white" role="separator" />
              <button
                className={`p-2 mx-2 uppercase cursor-pointer text-white ${
                  selectionScreenOpen ? 'font-bold' : ''
                }`}
                tabIndex={0}
                onClick={() =>
                  setSelectionScreenOpen && setSelectionScreenOpen(true)
                }
                onKeyDown={(e) =>
                  e.key === 'Enter'
                    ? setSelectionScreenOpen && setSelectionScreenOpen(true)
                    : null
                }
              >
                Selection
              </button>
            </>
          )}
          {!selectionScreenOpen && (
            <>
              <CircleIcon size={8} color="accent.4" aria-hidden={true} />
              <span className="p-2 mx-2 uppercase font-bold text-accent-contrast-lighter">
                Results
              </span>
            </>
          )}
        </>
      )}
      <div className="ml-auto mr-0">{rightComponent}</div>
    </nav>
  );
};

export default AnalysisBreadcrumbs;
