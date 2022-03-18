import React, { PropsWithChildren, ReactNode } from "react";
import Header, { HeaderProps } from "./Header";

interface NavPageLayoutProps extends HeaderProps {
    footer: ReactNode;
}
 const NavPageLayout: React.FC<NavPageLayoutProps> = ({ top, navigation, footer, children,
                                                }: PropsWithChildren<NavPageLayoutProps>) => {
    return (
        <div className="flex flex-col">
            <Header top={top} navigation={navigation }/>
            <main className="flex-grow">{children}</main>
            {footer }
        </div>
    );
};

export default NavPageLayout;
