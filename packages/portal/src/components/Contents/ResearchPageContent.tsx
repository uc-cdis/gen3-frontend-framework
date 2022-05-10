import React from 'react';
import Link from 'next/link';
import { Text } from '@mantine/core';
import CardGrid, { CardGridItem } from '../CardGrid';
import MultiPartText, { MultiPartTextPart } from '../MultiPartText';

export interface ResearchPageConfig {
    readonly title: string;
    readonly introduction: ReadonlyArray<MultiPartTextPart>;
    content: ReadonlyArray<CardGridItem>;
}

const ResearchPageContent = ({title, introduction, content}: ResearchPageConfig) => {
  return (
    <React.Fragment>
      <div className='py-10 text-sm px-20'>
        <Link href={'/'}>Home&nbsp;</Link>
        {' > '}
        <span className='text-heal-primary'>&nbsp;{title}</span>
      </div>
      <div className='text-md px-20'>
        <Text className='font-bold text-4xl text-gen3-coal font-montserrat pb-8'>{title}</Text>
        <MultiPartText parts={introduction} />
      </div>
      <CardGrid content={content}/>
    </React.Fragment>
  );
};

export default ResearchPageContent;
