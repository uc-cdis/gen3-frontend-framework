import React from 'react';
import Image from "next/image";
import { useRouter } from "next/router";

export interface FooterLinksProp {
    text: string;
    href: string;
}

export interface FooterProps {
    readonly links?: ReadonlyArray<FooterLinksProp>;
}

const Footer: React.FC<FooterProps> = ({ links = []} : FooterProps) => {
    const { basePath } = useRouter();

    return (
        <div className="flex flex-row bg-gen3-coal justify-end align-middle p-4 h-24 gap-x-8">
            <Image className="mr-20" src={`${basePath}/icons/gen3.png`}  layout="fixed" width="120px" height="60px" />
            <Image src={`${basePath}/icons/createdby.png`} layout="fixed" width="180px" height="60px" />
        </div>
    );
};

export default Footer;
