import React, { PropsWithChildren,ReactNode } from "react";

interface HeaderProps {
    readonly elements?:Array<ReactNode>
}

const Header: React.FC<HeaderProps> = (elements: HeaderProps) => {
    return (
        <div className="flex flex-col bg-yellow-50 justify-center text-center p-4 text-white">

        </div>
    );
};

export default Header;
