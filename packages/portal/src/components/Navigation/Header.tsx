import React, { PropsWithChildren,ReactNode } from "react";
import TopBar, {TopBarProps}  from "./TopBar";
import NavigationBar, {NavigationProps} from "./NavigationBar";

interface HeaderProps {
    readonly top: Record<any,any>
    readonly nav:  Record<any,any>
}

const Header: React.FC<HeaderProps> = ({ top, nav} : HeaderProps) => {
    return (
        <div className="w-100">
            <TopBar topItems={top.topItems}></TopBar>
            <NavigationBar title={nav.title} items={nav.items} ></NavigationBar>
        </div>
    );
};

export default Header;
