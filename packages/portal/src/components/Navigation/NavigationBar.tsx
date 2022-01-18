import React, { PropsWithChildren,ReactNode } from "react";
import HoverLink from "./HoverLink";
import { Icon } from '@iconify/react'


export interface NavigationButtonProps {
    readonly icon: string;
    readonly tooltip: string;
    readonly href: string;
    readonly name: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ icon, tooltip, href, name }: NavigationButtonProps) => {
    return (
        <a className="content-center" href={href} >
        <div className="flex flex-col flex-nowrap p-2 items-center font-heading opacity-80 border-b-3 border-b-transparent hover:border-blue-800">
            <Icon height="27" icon={icon}/>
                <p className="content-center pt-2">{name}</p>
        </div>
        </a>
    )
}

export interface NavigationProps {
    readonly title: string;
    readonly items: [NavigationButtonProps];
}

const NavigationBar: React.FC<NavigationProps> = ({ title, items }: NavigationProps) => {
    const { basePath } = useRouter();
    return (
            <div className="flex flex-row bg-gray-100 gap-x-4">
                <div className="flex flex-row items-center align-middle font-heading ml-6">
                    {title}
                </div>
                <div className="flex-grow">{/* middle section of header */}</div>
                <div className="flex flex-row pr-8  ">
                    { items.map((x, index) => {
                    return (
                        <div key={`${x.name}-${index}`} className="has-tooltip relative" >
                            <div
                                className="tooltip p-5 m-5 w-64 bg-white border-gray-400 border border-solid rounded text-center align-content-center">
                                {x.tooltip}
                            </div>
                            <div className="border-l-1 border-gray-400 opacity-80">
                            <NavigationButton icon = {x.icon} tooltip={x.tooltip} href={x.href} name={x.name} />

                            </div>
                        </div>)
                })
                }
                <div className="border-l-1 border-gray-400 opacity-80" />
            </div>
        </div>
    );
};

export default NavigationBar;
