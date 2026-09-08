import { Button } from '@mantine/core';
import React from 'react';
import TextContent from '../../../components/Content/TextContent';
import type { TextContentProps } from '../../../components/Content/TextContent';
import type { genericRegistrationAccessRequestFormOutcomeProps } from './types';

const GenericRegistrationAccessRequestOutcome = ({
  config,
}: {
  config: genericRegistrationAccessRequestFormOutcomeProps;
}) => {
  const { content, button } = config;
  return (
    <div className="w-full max-w-[500px] m-auto text-center">
      {content?.map((item: TextContentProps, index: number) => (
        <React.Fragment key={index}>
          <TextContent {...item} />
        </React.Fragment>
      ))}
      {button && (
        <Button
          component="a"
          variant={button.variant}
          href={button.href}
          className="mt-10"
        >
          {button.text}
        </Button>
      )}
    </div>
  );
};

export default GenericRegistrationAccessRequestOutcome;
