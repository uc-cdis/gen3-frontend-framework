import { Button } from '@mantine/core';
import React from 'react';
import TextContent, {
  TextContentProps,
} from '../../../components/Content/TextContent';
import { studyRegistrationAccessRequestFormSuccessProps } from './types';

const StudyRegistrationAccessRequestSuccess = ({
  config,
}: {
  config: studyRegistrationAccessRequestFormSuccessProps;
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

export default StudyRegistrationAccessRequestSuccess;
