import { Button } from '@mantine/core';
import React from 'react';
import TextContent from '../../../components/Content/TextContent';
import type { TextContentProps } from '../../../components/Content/TextContent';
import type { studyRegistrationAccessRequestFormOutcomeProps } from './types';
import { IconExternalLink } from '@tabler/icons-react';

const StudyRegistrationAccessRequestOutcome = ({
  outcomeConfig,
}: {
  outcomeConfig: studyRegistrationAccessRequestFormOutcomeProps;
}) => {
  const { content, buttons } = outcomeConfig;

  return (
    <div className="w-full max-w-xl m-auto text-center">
      {content?.map((item: TextContentProps, index: number) => (
        <TextContent key={index} {...item} />
      ))}
      {buttons &&
        buttons.map((button, index) => (
          <Button
            key={index}
            component="a"
            variant={button.variant}
            href={button.href}
            rightSection={button.externalLink && <IconExternalLink />}
            target={button.externalLink ? '_blank' : undefined}
            rel={button.externalLink ? 'noopener noreferrer' : undefined}
            className="mt-10 mr-1"
          >
            {button.text}
          </Button>
        ))}
    </div>
  );
};

export default StudyRegistrationAccessRequestOutcome;
