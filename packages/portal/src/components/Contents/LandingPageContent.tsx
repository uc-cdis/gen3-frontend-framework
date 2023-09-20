import * as React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

import { Title, TitleOrder } from '@mantine/core';

import { IconType } from 'react-icons';
import { MdFormatQuote, MdOutlineSearch, MdOutlineBarChart, MdGroup } from 'react-icons/md';
import { FaGraduationCap, FaRegQuestionCircle, FaVideo } from 'react-icons/fa';
import Gen3Link from '../Gen3Link';

export interface LandingPageContentProp {
    content: LandingPageProps
}



export interface landingPageLink {
    readonly href: string;
    readonly text: string;
    readonly linkType?: string;
}
export interface leftRightProps {
    readonly text?: string;
    readonly link?: landingPageLink;
    readonly image?: {
        readonly src: string;
        readonly alt: string;
        readonly position?: string;
    };
    readonly indent?: {
      readonly text?: string;
      readonly link?: landingPageLink;
      readonly style?: string;
    };
}
export interface LandingPageProps {
    readonly topTitle?: string;
    readonly body?: ReadonlyArray<{
        readonly title?: {
            readonly text: string;
            readonly level: TitleOrder;
        };
        readonly splitarea?: {
            readonly left: leftRightProps[];
            readonly right: leftRightProps[];
        };
        readonly full?: leftRightProps[];
        readonly break?: string;
        readonly cardsArea?: {
            readonly title: string;
            readonly cards: ReadonlyArray<{
                readonly icon: keyof IconType;
                readonly bodyText: string;
                readonly btnText: string;
                readonly href: string;
                readonly linkType?: string;
            }>;
        };
        readonly quoteArea?: {
            readonly quote: string;
            readonly author: string;
        };
    }>;
}

const LandingPageContent = ({ content }: LandingPageContentProp) => {
  const { basePath } = useRouter();
  return (
    <div className='sm:mt-3 2xl:mt-5 text-heal-dark_gray'>
      {content?.body?.map((component, index) => {
        if (component.title) {
          return <Title key={index} className='sm:mb-3 2xl:mb-4 mx-20' order={component.title.level}>{component.title.text}</Title>;
        }
        const splitareaJsx = (area: leftRightProps[]) => area.map((obj, index) => {
          if (obj.text) {
            return <p key={index} className='prose sm:prose-base 2xl:prose-lg mb-4 !mt-0 max-w-full' dangerouslySetInnerHTML={{ __html: obj.text }} />;
          }
          if (obj.link) {
            return <div className='heal-btn mb-4 mr-5 align-top' key={index}><Gen3Link className='flex flex-row items-center' href={obj.link.href} linkType={obj.link.linkType} text={obj.link.text} showExternalIcon /></div>;
          }
          if (obj.image) {
            return (
              <div key={index} className='h-full relative'>
                <Image
                  src={`${basePath}${obj.image.src}`}
                  alt={obj.image.alt}
                  layout='fill'
                  objectFit='contain'
                  objectPosition={obj.image.position || ''}
                />
              </div>
            );
          }
          if (obj.indent) {
            return <div className={`border-l-8 border-heal-magenta ml-1 pl-8 ${obj.indent.style || ''}`} key={`indent-${index}`}>
              {obj.indent.text && <p key={`indent-text-${index}`} className='prose sm:prose-base 2xl:prose-lg !mt-0' dangerouslySetInnerHTML={{ __html: obj.indent.text }} />
              }
              {obj.indent.link && <div className='heal-btn mr-5' key={`indent-link-${index}`}><Gen3Link className='flex flex-row items-center' href={obj.indent.link.href} linkType={obj.indent.link.linkType} text={obj.indent.link.text} showExternalIcon /></div>}
            </div>;
          }
        });
        if (component.splitarea) {
          return <div key={index} className='flex mx-20'>
            <div className='basis-1/2 pr-10'>
              {splitareaJsx(component.splitarea.left)}
            </div>
            <div className='basis-1/2'>
              {splitareaJsx(component.splitarea.right)}
            </div>
          </div>;
        }

        if (component.full) {
          return <div key={index} className='mx-20'>
            {splitareaJsx(component.full)}
          </div>;
        }
        if (component.break) {
          return <hr key={index} className='border sm:my-10 2xl:my-12 ' />;
        }
        if (component.cardsArea) {
          const allowedIcons = {
            FaGraduationCap: FaGraduationCap,
            FaRegQuestionCircle: FaRegQuestionCircle,
            FaVideo: FaVideo,
            MdOutlineSearch: MdOutlineSearch,
            MdOutlineBarChart: MdOutlineBarChart,
            MdGroup: MdGroup,
          };
          return <div key={index} className='text-center'>
            <Title className='my-5' order={3}>{component.cardsArea.title}</Title>
            <ul className='gap-4 mx-20 !p-0 flex'>
              {component.cardsArea.cards.map((card, index) => (
                <li key={index} className='border shadow-lg !p-5 w-1/5 flex flex-col justify-between items-center mx-5'>
                  {React.createElement(allowedIcons[card.icon], { title: `${card.btnText} icon`, className: 'inline-block text-7xl text-heal-magenta' })}
                  <p className='block text-gen3-titanium leading-6 mb-2'>{card.bodyText}</p>
                  <Gen3Link className='heal-btn heal-btn-rev' href={card.href} linkType={card.linkType} text={card.btnText} />
                </li>
              ))}
            </ul>
          </div>;
        }
        if (component.quoteArea) {
          return <div key={index} className='bg-heal-light_purple sm:p-16 2xl:p-20 text-center sm:mt-16 2xl:mt-20'>
            <div className='sm:text-3xl 2xl:text-4xl'><MdFormatQuote title='quotation mark' className='inline rotate-180 text-5xl mb-2' />{component.quoteArea.quote}<MdFormatQuote title='quotation mark' className='inline text-5xl mt-2' /></div>
            <div>{component.quoteArea.author}</div>
          </div>;
        }
        return null;
      })}
    </div>
  );
};

export default LandingPageContent;
