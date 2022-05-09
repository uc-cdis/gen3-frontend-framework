import React from 'react';
import Link from 'next/link';
import { Text } from '@mantine/core';
import CardGrid, { CardGridItem } from '../CardGrid';
import MultiPartText, { MultiPartTextPart } from '../MultiPartText';


export interface CommunityPageConfig {
    readonly title: string;
    readonly introduction: ReadonlyArray<MultiPartTextPart>;
    readonly sections: ReadonlyArray<{
        title: string; introduction: string; cards: ReadonlyArray<CardGridItem>;
    }>;
}



const CommunityPageContent = ({title, introduction, sections}: CommunityPageConfig) => {
  return (
    <React.Fragment>
      <div className='py-10 text-sm px-10'>
        <Link href={'/'}>Home&nbsp;</Link>
        {' > '}
        <span className='text-heal-primary'>&nbsp;{title}</span>
      </div>
      <div className='text-md pl-10'>
        <Text className='font-bold text-4xl text-gen3-coal font-montserrat pb-8'>{title}</Text>
        <div className='pl-5'>
          <MultiPartText parts={introduction}/>
          {
            (sections || []).map(
              ({title, introduction, cards}, i) => {
                return (
                  <div key={i} className ='mt-10'>
                    <Text className='font-bold text-3xl text-gen3-coal font-montserrat pb-8'>{title}</Text>
                    <Text className='font-montserrat text-xl'>{introduction}</Text>
                    <CardGrid content={cards}/>
                  </div>
                );

              }
            )
          }
        </div>
      </div>

    </React.Fragment>
  );
};

export default CommunityPageContent;
