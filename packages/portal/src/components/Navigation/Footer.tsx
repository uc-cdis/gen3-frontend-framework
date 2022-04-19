import React from 'react';
import Image from "next/image";
import { useRouter } from "next/router";
import Link from 'next/link';

interface BottomLinks {
    text: string;
    href: string;
}

interface ColumnLinks {
    heading: string;
    items: ReadonlyArray<{text: string; href?: string;}>;
}

export interface FooterProps {
    readonly bottomLinks?: ReadonlyArray<BottomLinks>;
    readonly columnLinks?: ReadonlyArray<ColumnLinks>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Footer: React.FC<FooterProps> = ({bottomLinks, columnLinks}: FooterProps) => {
    const { basePath } = useRouter();
    console.log(columnLinks)
    return <>
        <div className="bg-heal-dark_gray p-4">
            <div className="flex flex-row">
                <div className="flex flex-col mr-8 h-[100px] justify-between">
                    <Image src={`${basePath}/icons/gen3.png`} layout="fixed" width="80px" height="40px" />
                    <Image src={`${basePath}/icons/createdby.png`} layout="fixed" width="120px" height="40px" />
                </div>
                <div className="flex flex-col mr-8 h-[100px] justify-between">
                    <Image src={`${basePath}/icons/logo.png`} layout="fixed" height="100px" width="164px"/>
                </div>
                <div className="flex flex-row w-[100%] pl-10 pt-3">
                    {
                        (columnLinks || []).map(
                            ({heading, items}, i) => (
                                <div className="flex flex-col pl-10" key={i}>
                                    <h1 className="font-bold text-xl text-white font-montserrat">{heading}</h1>
                                    {
                                        (items || []).map(
                                            ({text, href}, i) => {
                                                const attrs = {
                                                    className: `${href && "heal-link-footer"} font-medium text-sm p-[2px] text-white font-montserrat`,
                                                    key: i
                                                };
                                                if (href) {
                                                    return <span {...attrs}><Link href={href}>{text}</Link></span>
                                                }
                                                else {
                                                    return <span {...attrs}>{text}</span>
                                                }
                                            }
                                        )
                                    }
                                </div>
                            )
                        )

                    }
                </div>
            </div>


            {(bottomLinks && bottomLinks.length > 0) ? (
              <div className="pt-[10px] m-1 align-middle text-xs text-white font-montserrat">
                {
                  bottomLinks.map((link, i) => (
                    <React.Fragment key={link.href}>
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='heal-link-footer'
                      >
                        {link.text ? link.text : link.href}
                      </a>
                      { i !== bottomLinks.length - 1 && <span className='mx-1'>|</span> }
                    </React.Fragment>
                  ))
                }
              </div>
            ): null
        }
        </div>
    </>
};

export default Footer;
