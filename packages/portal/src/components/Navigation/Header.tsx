import React from "react";
import TopBar from "./TopBar";
import NavigationBar from "./NavigationBar";

interface HeaderProps {
    readonly top: Record<any, any>
    readonly nav: Record<any, any>
}

const Header: React.FC<HeaderProps> = ({ top, nav }: HeaderProps) => {
    return (
        <div className="w-100">
            <TopBar topItems={top.items}></TopBar>
            <NavigationBar logo={nav.logo} title={nav.title} items={nav.items} ></NavigationBar>
        </div>
    );
};

export default Header;
