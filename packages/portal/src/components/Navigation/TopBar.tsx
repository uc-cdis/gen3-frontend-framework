import React from 'react'
import { Icon } from '@iconify/react'

export interface NameAndIcon {
    readonly name: string;
    readonly icon?: string;
}

export interface TopIconButtonProps extends NameAndIcon {
    readonly href: string;
}


const TopIconButton:React.FC<NameAndIcon> = ({ name, icon = undefined } : NameAndIcon ) => {
    return (
        <div className="flex flex-row mr-[10px] items-center align-middle hover:border-b-1 hover:border-gen3-white " role='button' >
            {icon ? <Icon icon={icon} className="text-gen3-white"/> : null }
            <p className="body-typo text-gen3-white"> {name} </p>
        </div>
    );
}

const AccountTopButton = () => {
    return (
        <div className="flex flex-row mx-6 items-center align-middle text-gen3-white text-sm hover:border-b-1 hover:border-gen3-white" role='button'>
            {"Login"}
        </div>
    );
}

export interface TopBarProps {
    readonly items: TopIconButtonProps[];
}

const TopBar: React.FC<TopBarProps> = ( { items } : TopBarProps) => {
    return (
        <div >
            <header className='flex flex-row justify-end items-center align-middle w-100 h-10 bg-heal-purple'>
                <nav className='flex flex-row items-center align-middle font-montserrat'>
                    {
                        items.map((x) => {
                           return ( <a className="flex flex-row" href={x.href} key={x.href}>
                                   <TopIconButton name={x.name} icon={x.icon}/>
                                   <div className="pr-2 ml-1  border-r-2 border-solid h-6 "/>
                            </a>
                           );
                        })

                    }
                    <AccountTopButton />
                </nav>
            </header>
        </div>
    );
};

export default TopBar;
