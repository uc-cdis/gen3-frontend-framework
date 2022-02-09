import React, { PropsWithChildren }  from 'react'
import { Icon } from '@iconify/react'
import HoverLink from "./HoverLink";

interface TopIconButtonProps {
    readonly name: string;
    readonly icon?: string;
}

const TopIconButton:React.FC<TopIconButtonProps> = ({ name, icon = undefined } : TopIconButtonProps ) => {
    return (
        <div className="flex flex-row mr-[10px] items-center align-middle hover:border-b-1 hover:border-gen3-white " role='button' >
            <p className=" body-typo text-gen3-white"> {name} </p>{icon ? <Icon icon={icon} /> : null }
        </div>
    );
}

const AccountTopButton = () => {
    return (
        <div className="flex flex-row mx-6 items-center align-middle text-gen3-white text-sm hover:border-b-1 hover:border-gen3-white" role='button'>
            {"Login"} <Icon height="1.25rem" icon={"mdi:login-variant"} />
        </div>
    );
}

export interface TopBarProps {
    readonly topItems: [Record<string, any>];
}

const TopBar: React.FC<TopBarProps> = ( { topItems} : TopBarProps) => {
    return (
        <div >
            <header className='flex flex-row justify-end items-center align-middle w-100 h-10 bg-heal-secondary'>
                <nav className='flex flex-row items-center align-middle font-montserrat'>
                    {
                        topItems.map((x, index, { length}) => {
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
