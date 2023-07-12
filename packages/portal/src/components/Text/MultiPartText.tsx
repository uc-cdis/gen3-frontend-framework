import { Text } from '@mantine/core';
import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

export interface MultiPartTextProps {
  readonly parts: ReadonlyArray<MultiPartTextPart>;
}

export interface MultiPartTextPart {
  type: 'text' | 'link' | 'bold' | 'break';
  content?: string;
  link?: string;
  linkType: string;
}

const MultiPartText = ({ parts }: MultiPartTextProps) => {
  return (
    <React.Fragment>
      {parts.map(({ type, content, link }, i) => {
        return {
          text: (
            <span className="text-xl" key={i}>
              {content}
            </span>
          ),
          boldText: (
            <span className="text-xl font-bold" key={i}>
              {content}
            </span>
          ),
          link: (
            <a
              className="text-gen3-base_blue no-underline font-bold"
              href={link}
              key={i}
            >
              {' '}
              {content}
            </a>
          ),
          outboundLink: (
            <a
              className="text-gen3-base_blue flex flex-row items-baseline no-underline font-bold px-10 mb-5"
              href={link}
              target="_blank"
              rel="noreferrer"
              key={i}
            >
              <FaExternalLinkAlt className="pr-1 pt-2" /> {content}
            </a>
          ),
          bold: (
            <Text
              className="font-bold text-4xl text-gen3-coal font-montserrat pb-8"
              key={i}
            >
              {content}
            </Text>
          ),
          break: <br key={i} />,
        }[type];
      })}
    </React.Fragment>
  );
};

export default MultiPartText;
