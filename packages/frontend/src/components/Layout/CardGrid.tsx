import React from 'react';
import { Grid, Text } from '@mantine/core';
import { FaExternalLinkAlt } from 'react-icons/fa';

export interface CardGridProps {
  content: ReadonlyArray<CardGridItem>;
}

export interface CardGridItem {
  title: string;
  linkText: string;
  content: string;
  link: string;
}

const CardGrid = ({ content }: CardGridProps) => {
  return (
    <Grid gutter="xl" className="m-0">
      {/* m-0 added to override default -12px margin */}
      {content.map(({ title, content, linkText, link }, i) => (
        <Grid.Col key={i} span={4} className="min-w-[250px] max-w-[400px]">
          <div className="border shadow-lg p-5 flex flex-col justify-between min-w-min h-full">
            <Text className="font-bold text-2xl text-heal-secondary">
              {title}
            </Text>
            <Text className="mb-3 block text-gen3-titanium text-xl leading-6">
              {content}
            </Text>
            <div className="flex flex-row justify-center">
              <a
                href={link}
                className="heal-btn heal-btn-rev mb-3 w-[80%]"
                target="_blank"
                rel="noreferrer"
              >
                <span className="flex flex-row items-baseline justify-center">
                  <FaExternalLinkAlt className="mr-2" />
                  {linkText}
                </span>
              </a>
            </div>
          </div>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default CardGrid;
