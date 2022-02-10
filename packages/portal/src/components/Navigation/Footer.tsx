import React from 'react';
import Image from "next/image";
import { useRouter } from "next/router";

const Footer: React.FC<unknown> = () => {
    const { basePath } = useRouter();

    return (
        <div className="flex flex-row bg-gen3-coal justify-end align-middle p-4 h-24 gap-x-8">
            <Image className="mr-20" src={`${basePath}/icons/gen3.png`}  layout="fixed" width="120px" height="60px" />
            <Image src={`${basePath}/icons/createdby.png`} layout="fixed" width="180px" height="60px" />
        </div>
    );
};

export default Footer;
