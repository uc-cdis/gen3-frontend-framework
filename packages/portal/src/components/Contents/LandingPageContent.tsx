import * as React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from "next/link";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

import { Title, TitleOrder } from '@mantine/core';

import { IconType } from 'react-icons';
import { MdFormatQuote, MdOutlineSearch, MdOutlineBarChart, MdGroup } from 'react-icons/md';
import { FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa';

export interface LandingPageContentProp {
    content: LandingPageProps
}


export interface leftRightProps {
    readonly text?: string;
    readonly link?: {
        readonly href: string;
        readonly text: string;
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
                readonly link: string;
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
        <div className='sm:mt-8 2xl:mt-10 text-heal-dark_gray'>
            {content?.body?.map((component, index) => {
                if (component.title) {
                    return <Title key={index} className='mb-5 mx-20' order={component.title.level}>{component.title.text}</Title>;
                }
                if (component.splitarea) {
                    const splitareaJsx = (area: leftRightProps[]) => area.map((obj, index) => {
                        if (obj.text) {
                            return <p key={index} className='prose sm:prose-base 2xl:prose-lg mb-5 !mt-0' dangerouslySetInnerHTML={{ __html: obj.text }} />;
                        }
                        if (obj.link) {
                            // if external link
                            if (obj.link.href.indexOf('//') > -1) {
                                return <a key={index} className='heal-btn mb-5' href={obj.link.href} target='_blank' rel="noreferrer">                            <FaExternalLinkAlt className='inline-block pb-1 pr-1' title='External Link' /> {obj.link.text}</a>
                            } else if (obj.link.href.charAt(0) === '/') {
                                return <Link key={index} href={obj.link.href}>
                                    <a className='heal-btn mb-5'>
                                        {obj.link.text}
                                    </a>
                                </Link>;
                            }
                            //temp for linking back to base path also remove above else if
                            return <a key={index} href={`/${obj.link.href}`} className='heal-btn mb-5'>
                                {obj.link.text}
                            </a>;
                        }
                        if (obj.image) {
                            return (
                                <div key={index} className='h-full relative'>
                                    <Image
                                        src={`${basePath}${obj.image.src}`}
                                        alt={obj.image.alt}
                                        layout='fill'
                                        objectFit='contain'
                                    />
                                </div>
                            );
                        }
                    });
                    return <div key={index} className='flex mx-20'>
                        <div className='basis-1/2 pr-10'>
                            {splitareaJsx(component.splitarea.left)}
                        </div>
                        <div className='basis-1/2'>
                            {splitareaJsx(component.splitarea.right)}
                        </div>
                    </div>;
                }
                if (component.break) {
                    return <hr key={index} className='border sm:my-10 2xl:my-12 ' />
                }
                if (component.cardsArea) {
                    const allowedIcons = {
                        FaGraduationCap: FaGraduationCap,
                        MdOutlineSearch: MdOutlineSearch,
                        MdOutlineBarChart: MdOutlineBarChart,
                        MdGroup: MdGroup,
                    }
                    return <div key={index} className='text-center'>
                        <Title className='my-5' order={3}>{component.cardsArea.title}</Title>
                        <ul className='gap-4 mx-20 !p-0'>
                            {component.cardsArea.cards.map((card, index) => (
                                <li key={index} className='border shadow-lg !p-5 w-1/5 inline-block mx-5 align-top'>
                                    {React.createElement(allowedIcons[card.icon], { title: `${card.btnText} icon`, className: 'inline-block text-7xl text-heal-magenta' })}
                                    <p className='block text-gen3-titanium leading-6 h-20'>{card.bodyText}</p>
                                    {//temp for linking back to base path
                                        card.link.charAt(0) === '/' ?
                                            <Link href={`${card.link}`}><a className='heal-btn heal-btn-rev'>{card.btnText}</a></Link>
                                            :
                                            <a className='heal-btn heal-btn-rev' href={`/${card.link}`}>{card.btnText}</a>
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>;
                }
                if (component.quoteArea) {
                    return <div key={index} className='bg-heal-light_purple sm:p-16 2xl:p-20 text-center sm:mt-16 2xl:mt-20'>
                        <div className='sm:text-3xl 2xl:text-4xl'><MdFormatQuote title='quotation mark' className='inline rotate-180 text-5xl mb-2' />{component.quoteArea.quote}<MdFormatQuote title='quotation mark' className='inline text-5xl mt-2' /></div>
                        <div>{component.quoteArea.author}</div>
                    </div>
                }
                return null;
            })}
        </div>
    );
}

export default LandingPageContent;
