import React from 'react';
import HoverLink from './HoverLink';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

export interface NavigationButtonProps {
    readonly icon: string;
    readonly tooltip: string;
    readonly href: string;
    readonly name: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({tooltip, icon, href, name} : NavigationButtonProps ) => {
  return (
    <div className='has-tooltip relative h-[80px]'>
      <a className='content-center' href={`${(process.env.NEXT_PUBLIC_PORTAL_BASENAME && process.env.NEXT_PUBLIC_PORTAL_BASENAME !== '/') ? process.env.NEXT_PUBLIC_PORTAL_BASENAME : ''}${href}`} >
        <div className='flex flex-col min-w-[110px] flex-nowrap px-[2px] py-2 pt-[14px] items-center font-sans text-sm border-b-3 border-b-transparent hover:border-heal-primary opacity-80 hover:opacity-100'>
          <Icon height='27px' icon={icon} className='mt-[2px] ml-[4px]'/>
          <p className='content-center pt-1.5 font-montserrat body-typo'>{name}</p>
        </div>
      </a>
      <div
        className='opacity-100 tooltip p-2.5 m-5 w-60 bg-white border-gray-400 border border-solid rounded text-left align-content-center text-gen3-titanium'>
        {tooltip}
      </div>
    </div>
  );
};

export interface NavigationProps {
    readonly logo?:string;
    readonly title?:string;
    readonly logoWidth?:number; // TODO: refactor this into configuration
    readonly logoHeight?:number;
    readonly items: [NavigationButtonProps];
}

const NavigationBar: React.FC<NavigationProps> = ({ logo = undefined, title = undefined, logoWidth=199, logoHeight=64, items} : NavigationProps) => {
  const { basePath } = useRouter();

  return (
    <div className='flex flex-row border-b-1 bg-gen3-white border-gen3-smoke'>
      <div className='flex flex-row items-center align-middle font-montserrat font-bold tracking-wide text-xl ml-[20px] mr-[20px]'>
        {logo && <HoverLink href={'/'}>
          <Image className='pr-[6px] pt-4' width={logoWidth} height={logoHeight}  src={`${basePath}${logo}`} alt={logo}/>
        </HoverLink >  }
        {(logo && title ) && <div className='border-solid border-gen3-smoke border-l-1 ml-[2px] mr-[7px] h-[64px] w-1 '/> }
        <HoverLink className='font-montserrat h3-typo pt-[4px] text-gen3-coal hover:text-gen3-black hover:border-gen3-highlight_orange hover:border-b-3' href={'/'}>{`${title}`}</HoverLink>
      </div>
      <div className='flex-grow'>{/* middle section of header */}</div>
      <div className='flex flex-row pl-[30px] pr-[20px] '>
        { items.map((x, index) => {
          return (
            <div key={`${x.name}-${index}`} >
              <div className='border-l-1 border-gen3-smoke'>
                <NavigationButton tooltip={x.tooltip} icon = {x.icon} href={x.href} name={x.name} />
              </div>
            </div>);
        })
        }
        <div className='border-l-1 border-gray-400 opacity-80'/>
      </div>
    </div>
  );
};

export default NavigationBar;
