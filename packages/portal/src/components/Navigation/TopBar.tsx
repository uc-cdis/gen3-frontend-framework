import React from 'react';
import { Icon } from '@iconify/react';
import { checkCookies} from 'cookies-next';

export interface NameAndIcon {
  readonly name: string;
  readonly icon?: string;
}

export interface TopIconButtonProps extends NameAndIcon {
  readonly href: string;
}

const TopIconButton: React.FC<NameAndIcon> = ({
  name,
  icon = undefined,
}: NameAndIcon) => {
  return (
    <div
      className='flex flex-row mr-[10px] items-center align-middle hover:border-b-1 hover:border-gen3-white '
      role='button'
    >
      {icon ? <Icon icon={icon} className='text-gen3-white' /> : null}
      <p className='body-typo text-gen3-white'> {name} </p>
    </div>
  );
};

const AccountLoginButton = () => {
  return (
    <a href={'/login'}>
      <div
        className='flex flex-row mx-6 items-center align-middle text-gen3-white text-sm hover:border-b-1 hover:border-gen3-white'
        role='button'
      >
        {'Login'} <Icon height='1.25rem' icon={'mdi:login-variant'} />
      </div>
    </a>
  );
};

const AccountLogoutButton = () => {
  return (
    <a href={'/logoff?next=/landing'}>
      <div
        className='flex flex-row mx-6 items-center align-middle text-gen3-white text-sm hover:border-b-1 hover:border-gen3-white'
        role='button'
      >
        {'Logoff'} <Icon height='1.25rem' icon={'mdi:login-variant'} />
      </div>
    </a>
  );
};

const  getCookie = (name:string) => {
  const cookie:Record<string, string> = {};
  document.cookie.split(';').forEach(function(el) {
    const [k,v] = el.split('=');
    cookie[k.trim()] = v;
  });
  return cookie[name];
};

const AccountTopButton = () => {
  const access_token = getCookie('access_token');

  console.log('access_token: ', access_token);
  return (
    access_token !== undefined ? <AccountLoginButton /> : <AccountLogoutButton />
  );

};

export interface TopBarProps {
  readonly items: TopIconButtonProps[];
}

const TopBar: React.FC<TopBarProps> = ({ items }: TopBarProps) => {
  return (
    <div>
      <header className='flex flex-row justify-end items-center align-middle w-100 h-10 bg-heal-secondary'>
        <nav className='flex flex-row items-center align-middle font-montserrat'>
          {items.map((x) => {
            return (
              <a className='flex flex-row' href={`${x.href}`} key={x.href}>
                <TopIconButton name={x.name} icon={x.icon} />
                <div className='pr-2 ml-1  border-r-2 border-solid h-6 ' />
              </a>
            );
          })}

          <AccountTopButton />
        </nav>
      </header>
    </div>
  );
};

export default TopBar;
