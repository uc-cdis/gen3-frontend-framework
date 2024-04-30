import * as React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { Title, TitleOrder } from '@mantine/core';
import { IconType } from 'react-icons';
import { Gen3Button, Gen3ButtonReverse } from '../Buttons/Gen3Button';

import {
  MdFormatQuote,
  MdOutlineSearch,
  MdOutlineBarChart,
  MdGroup,
} from 'react-icons/md';
import { FaGraduationCap, FaRegQuestionCircle, FaVideo } from 'react-icons/fa';
import Gen3Link from '../../features/Navigation/Gen3Link';
import TextContent, { ContentType } from './TextContent';

export interface LandingPageContentProp {
  content: LandingPageProps;
}

export interface leftRightProps {
  readonly text?: string;
  readonly type?: ContentType;
  readonly link?: {
    readonly href: string;
    readonly text: string;
    readonly linkType?: string;
  };
  readonly image?: {
    readonly src: string;
    readonly alt: string;
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

/**
 * Landing Page contents. Edit this component to change the composition of the landing page.
 * @param content - Refer to LandingPageProps interface above. Loaded from config file
 * located at sampleCommons/config/{commons}/landingPage.json
 */
const LandingPageContent = ({ content }: LandingPageContentProp) => {
  const { basePath } = useRouter();
  return (
    <div className="sm:mt-8 2xl:mt-10 w-full bg-base-max">
      {content?.body?.map((component, index) => {
        if (component.title) {
          return (
            <Title
              key={index}
              color={index % 2 === 0 ? 'primary.5' : 'primary.4'}
              className="mb-5 pl-20 pb-2"
              order={component.title.level}
            >
              {component.title.text}
            </Title>
          );
        }
        if (component.splitarea) {
          const splitareaJsx = (area: leftRightProps[]) =>
            area.map((obj, index) => {
              if (obj.text) {
                return (
                  <TextContent text={obj.text} key={index} type={obj?.type ?? ContentType.Html} className="prose sm:prose-base 2xl:prose-lg mb-5 !mt-0"/>
                );
              }
              if (obj.link) {
                return (
                  <Gen3Button
                    colors="accent-lighter"
                    className="mb-5 mr-5 text-accent-contrast-lighter"
                    key={index}
                  >
                    <Gen3Link
                      className="flex items-center"
                      href={obj.link.href}
                      linkType={obj.link.linkType}
                      text={obj.link.text}
                      showExternalIcon
                    />
                  </Gen3Button>
                );
              }
              if (obj.image) {
                return (
                  <div key={index} className="h-full relative">
                    <Image
                      src={`${basePath}${obj.image.src}`}
                      alt={obj.image.alt}
                      fill
                    />
                  </div>
                );
              }
            });
          return (
            <div key={index} className="flex mx-20">
              <div className="basis-1/2 pr-10">
                {splitareaJsx(component.splitarea.left)}
              </div>
              <div className="basis-1/2">
                {splitareaJsx(component.splitarea.right)}
              </div>
            </div>
          );
        }
        if (component.break) {
          return <hr key={index} className="border sm:my-10 2xl:my-12" />;
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
          return (
            <div key={index} className="text-center">
              <Title className="my-5" order={3}>
                {component.cardsArea.title}
              </Title>
              <ul className="gap-4 mx-20 !p-0 flex">
                {component.cardsArea.cards.map((card, index) => (
                  <li
                    key={index}
                    className="border shadow-lg !p-5 w-1/5 flex flex-col justify-between items-center mx-5"
                  >
                    {React.createElement(allowedIcons[card.icon], {
                      title: `${card.btnText} icon`,
                      className: 'inline-block text-7xl text-accent-lighter',
                    })}
                    <p className="block text-primary leading-6 mb-2">
                      {card.bodyText}
                    </p>
                    <Gen3ButtonReverse
                      colors="accent-lighter"
                      className="mb-5 mr-5 text-base-contrast-lighter"
                      key={index}
                    >
                      <Gen3Link
                        href={card.href}
                        linkType={card.linkType}
                        text={card.btnText}
                      />
                    </Gen3ButtonReverse>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        if (component.quoteArea) {
          return (
            <div
              key={index}
              className="bg-secondary-lightest sm:p-16 2xl:p-20 text-center sm:mt-16 2xl:mt-20"
            >
              <div className="sm:text-3xl 2xl:text-4xl">
                {component.quoteArea.author ? (
                  <MdFormatQuote
                    title="quotation mark"
                    className="inline rotate-180 text-5xl mb-2"
                  />
                ) : null}
                {component.quoteArea.quote}
                {component.quoteArea.author ? (
                  <MdFormatQuote
                    title="quotation mark"
                    className="inline text-5xl mt-2"
                  />
                ) : null}
              </div>
              <div>{component.quoteArea.author}</div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default LandingPageContent;
