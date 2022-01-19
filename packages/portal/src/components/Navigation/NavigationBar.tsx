import React from "react";
import dictIcons from '../../img/icons'
import IconComponent from '../IconComponent'


export interface NavigationButtonProps {
    readonly icon: string;
    readonly tooltip: string;
    readonly href: string;
    readonly name: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ icon, tooltip, href, name }: NavigationButtonProps) => {
    return (
        <a className="content-center" href={href} >
            <div className="flex flex-col flex-nowrap p-2 border-l-1 border-gray-400 justify-items-center font-heading opacity-80">
                <IconComponent height="27px" iconName={icon} dictIcons={dictIcons} />
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
    return (
        <div className="flex flex-row bg-gray-100 gap-x-4">
            <div className="flex flex-row items-center align-middle font-heading ml-6">
                {title}
            </div>
            <div className="flex-grow">{/* middle section of header */}</div>
            <div className="flex flex-row pr-8">
                {items.map((x, index) => {
                    return (
                        <div key={`${x.name}-${index}`}>
                            <NavigationButton icon={x.icon} tooltip={x.tooltip} href={x.href} name={x.name} />
                        </div>)
                })
                }
                <div className="border-l-1 border-gray-400 opacity-80" />
            </div>
        </div>
    );
};

export default NavigationBar;
