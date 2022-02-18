import React from 'react';
import Image from "next/image";
import { useRouter } from "next/router";

export interface FooterHEALProps {
    readonly links: ReadonlyArray<FooterLinksProp>;
}

export interface FooterLinksProp {
    text: string;
    href: string;
}

const FooterHEAL: React.FC<FooterHEALProps> = ({ links }: FooterHEALProps) => {
    const { basePath } = useRouter();

    return (
        <div className="flex flex-col bg-heal-dark_gray h-full p-4">
            <div className="flex flex-row justify-start align-middle">
                <div className="mr-8">
                    <Image src={`${basePath}/icons/gen3.png`} layout="fixed" width="120px" height="60px" />
                </div>
                <Image src={`${basePath}/icons/createdby.png`} layout="fixed" width="180px" height="60px" />
            </div>
            {(links && links.length > 0) ? (
              <div className="flex flex-row justify-center m-1 align-middle text-tiny text-white font-montserrat">
                {
                  links.map((link, i) => (
                    <React.Fragment key={link.href}>
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='heal-link-footer'
                      >
                        {link.text ? link.text : link.href}
                      </a>
                      { i !== links.length - 1 && <span className='mx-1'>|</span> }
                    </React.Fragment>
                  ))
                }
              </div>
            ): null}
        </div>
    );
};

export default FooterHEAL;
