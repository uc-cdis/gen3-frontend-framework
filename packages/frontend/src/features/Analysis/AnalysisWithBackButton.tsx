import React, { useState } from 'react';
import AnalysisCenter from './AnalysisCenter';
import { AnalysisCenterConfiguration, CardTitleAndHRef } from './types';
import IFrameComponent from '../../components/IFrameComponent';
import {
  ActionIcon,
  Center,
  Stack,
  Text,
  Tooltip,
  Transition,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Icon } from '@iconify-icon/react';

const CROSSFADE_DURATION = 500;

// Both panels share the same grid cell (row/col 1) so they overlap and can
// crossfade instead of pushing each other around the flex column.
const overlayCell: React.CSSProperties = { gridArea: '1 / 1' };

const DEFAULT_DESCRIPTION =
  "The Jupyter notebooks contained in this notebook viewer pull data from various sources to generate and output useful tables, charts, graphs, and models. Each notebook is static, meaning the data being used by the notebooks is not updated in real time. Executable versions of these notebooks are also available in the 'Tutorials' Gen3 Workspace Image.";

const AnalysisWithCloseButton = ({
  tools,
  label,
  description,
}: AnalysisCenterConfiguration) => {
  const [currentTool, setCurrentTool] = useState<CardTitleAndHRef | null>(null);
  const [toolOpened, handlers] = useDisclosure(false);

  const openNotebook = (tool: CardTitleAndHRef | null) => {
    setCurrentTool(tool);
    handlers.open();
  };

  return (
    <div className="relative grid w-full h-full">
      <Transition
        mounted={!toolOpened}
        transition="fade"
        duration={CROSSFADE_DURATION}
      >
        {(styles) => (
          <div
            className="flex flex-col w-full bg-base-lightest py-2 pt-8 h-full overflow-hidden"
            style={{ ...overlayCell, ...styles }}
          >
            <div className="flex w-full nowrap mb-2 px-20">
              <Stack gap="xs" align="center" justify="center">
                <Text size="2em">{label ?? 'Jupyter Notebook Tutorials'}</Text>
                <Center>
                  <Text size="sm" ta="center" textWrap="balance">
                    {description ?? DEFAULT_DESCRIPTION}
                  </Text>
                </Center>
              </Stack>
            </div>
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
            className="flex flex-col w-full bg-base-lightest px-4 h-full"
            style={{ ...overlayCell, ...styles }}
          >
            <div className="flex w-full nowrap justify-start items-center m-2">
              <Tooltip label="Back to Notebook list">
                <ActionIcon
                  variant="outline"
                  radius="xl"
                  size="lg"
                  aria-label="Back to Notebook list"
                  color="accent.5"
                  className="mr-4"
                  onClick={() => handlers.close()}
                >
                  <Icon
                    icon="gen3:back-arrow"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                  />
                </ActionIcon>
              </Tooltip>
              <Text fw={500} size="2em">
                Back to Notebook List
              </Text>
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
