import React, { useState } from 'react';
import AnalysisCenter from './AnalysisCenter';
import { AnalysisCenterConfiguration, CardTitleAndHRef } from './types';
import { CloseIcon } from '../../types/icons';
import IFrameComponent from '../../components/IFrameComponent';
import { Button, Tooltip, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const CROSSFADE_DURATION = 500;

// Both panels share the same grid cell (row/col 1) so they overlap and can
// crossfade instead of pushing each other around the flex column.
const overlayCell: React.CSSProperties = { gridArea: '1 / 1' };

const AnalysisWithCloseButton = ({ tools }: AnalysisCenterConfiguration) => {
  const [currentTool, setCurrentTool] = useState<CardTitleAndHRef | null>(null);
  const [toolOpened, handlers] = useDisclosure(false);

  const openNotebook = (tool: CardTitleAndHRef | null) => {
    setCurrentTool(tool);
    handlers.open();
  };

  return (
    <div className="relative grid w-full h-full overflow-hidden">
      <Transition
        mounted={!toolOpened}
        transition="fade"
        duration={CROSSFADE_DURATION}
      >
        {(styles) => (
          <div
            className="flex w-full bg-base-light px-1 py-2 pt-8 h-full overflow-hidden"
            style={{ ...overlayCell, ...styles }}
          >
            <AnalysisCenter tools={tools} onButtonClick={openNotebook} />
          </div>
        )}
      </Transition>
      <Transition
        mounted={toolOpened}
        transition="fade"
        duration={CROSSFADE_DURATION}
        onExited={() => setCurrentTool(null)}
      >
        {(styles) => (
          <div
            className="flex flex-col w-full bg-base-light px-4 h-full"
            style={{ ...overlayCell, ...styles }}
          >
            <div className="flex w-full nowrap justify-end m-2 ">
              <Tooltip label={`Close ${currentTool?.title}`}>
                <Button
                  onClick={() => handlers.close()}
                  aria-label={`Close ${currentTool?.title}`}
                  size="xs"
                >
                  <CloseIcon size={20} aria-hidden="true" />
                </Button>
              </Tooltip>
            </div>

            <div className="w-full h-full">
              <IFrameComponent url={currentTool?.href} />
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default AnalysisWithCloseButton;
