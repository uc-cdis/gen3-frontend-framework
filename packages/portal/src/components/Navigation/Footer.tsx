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

export interface FooterProps {
    readonly bottomLinks?: ReadonlyArray<BottomLinks>;
    readonly columnLinks?: ReadonlyArray<ColumnLinks>;
}

const Footer: React.FC<FooterProps> = ({ bottomLinks, columnLinks }: FooterProps) => {
  const { basePath } = useRouter();
  return <React.Fragment>
    <div className='bg-heal-dark_gray px-8 py-4'>
      <div className='flex flex-row items-center justify-between'>
        <div className='flex flex-row items-center'>
          <div className='flex flex-col mr-8 h-[100px] justify-between'>
            <Image src={`${basePath}/icons/gen3.png`} layout='fixed' width='80px' height='40px' />
            <Image src={`${basePath}/icons/createdby.png`} layout='fixed' width='120px' height='40px' />
          </div>
          <div className='flex flex-col mr-8 h-[100px]'>
            <Image src={`${basePath}/icons/logo.png`} layout='fixed' height='100px' width='164px' />
          </div>
          <div className='w-[20%] text-xs text-white text-left font-montserrat'>
            <p className='p-[4px]'>The HEAL Data Platform is funded by the NIH HEAL Initiative.</p>
            <p className='p-[4px]'>NIH HEAL Initiative and Helping to End Addiction Long-term are service marks of the U.S. Department of Health and Human Services.</p>
          </div>
        </div>

        <div className='flex flex-col justify-between'>
          <div className='flex flex-row'>
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
                        }
                      )
                    }
                  </div>
                )
              )

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
