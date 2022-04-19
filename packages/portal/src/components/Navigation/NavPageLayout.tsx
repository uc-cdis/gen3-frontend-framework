import React, { PropsWithChildren } from "react";
import Footer, { FooterProps } from "./Footer";
import Header, { HeaderProps } from "./Header";

export interface NavPageLayoutProps {
    headerProps: HeaderProps
    footerProps: FooterProps;
}

const NavPageLayout: React.FC<NavPageLayoutProps> = (
    { headerProps, footerProps, children }: PropsWithChildren<NavPageLayoutProps>
) => {
    return (
        <div className="flex flex-col h-[100vh]">
            <Header {...headerProps}/>
            <main className="flex-grow">{children}</main>
            <Footer {...footerProps}/>
        </div>
    );
};

export default NavPageLayout;
