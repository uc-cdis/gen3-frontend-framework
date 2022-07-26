import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Gen3Link from '../Gen3Link';

interface BottomLinks {
  text: string;
  href: string;
}

interface ColumnLinks {
    heading: string;
    items: ReadonlyArray<{ text: string; href?: string; linkType: 'gen3ff' | 'portal' | undefined }>;
}

interface FooterLogo {
  readonly logo: string;
  readonly width: string | number;
  readonly height: string | number;
}

export interface FooterProps {
    readonly bottomLinks?: ReadonlyArray<BottomLinks>;
    readonly columnLinks?: ReadonlyArray<ColumnLinks>;
    readonly footerLogos?: ReadonlyArray<ReadonlyArray<FooterLogo>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Footer: React.FC<FooterProps> = ({ bottomLinks, columnLinks, footerLogos }: FooterProps) => {
  const { basePath } = useRouter();
  return <React.Fragment>
    <div className='bg-heal-dark_gray p-4'>
      <div className='flex flex-row'>
        {
          (footerLogos || [[]]).map((col, index) => {
            return (
              <div key={`footer-col-${index}`} className={`flex flex-col mr-8 ${col.length>1 ? 'justify-between' : ''}`}>
                {
                  col.map((logo) =>
                    <Image key={`${basePath}/icons/${logo.logo}`}
                      src={`${basePath}/icons/${logo.logo}`}
                      layout='fixed' width={logo.width} height={logo.height} />
                  )}
              </div>
            );
          })
        }
        <div className='flex flex-row w-[100%] pl-10 pt-3'>
          {
            (columnLinks || []).map(
              ({ heading, items }, i) => (
                <div className='flex flex-col pl-10' key={i}>
                  <h1 className='font-bold text-xl text-white font-montserrat'>{heading}</h1>
                  {
                    (items || []).map(
                      ({ text, href, linkType }, i) => {
                        const attrs = {
                          className: `${href && 'heal-link-footer'} font-medium text-sm p-[2px] text-white font-montserrat`,
                          key: i
                        };
                        if (href) {
                          return <div {...attrs}><Gen3Link href={href} linkType={linkType} text={text}/></div>;
                        }
                        else {
                          return <span {...attrs}>{text}</span>;
                        }
                      )
                    }
                  </div>
                )
              )
            )
          }
        </div>
      </div>

            }
          </div>
          {(bottomLinks && bottomLinks.length > 0) ? (
            <div className='pt-[4px] m-1 text-right text-xs text-white font-montserrat'>
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
                    {i !== bottomLinks.length - 1 && <span className='mx-1'>|</span>}
                  </React.Fragment>
                ))
              }
            </div>
          ) : null
          }
        </div>
      </div>
    </div>
  </React.Fragment>;
};

export default Footer;
