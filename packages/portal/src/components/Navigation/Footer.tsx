import React from 'react';
import Image from "next/image";
import style from './Footer.module.css';

const Footer: React.FC<unknown> = () => {
    return (
        <div className="flex flex-row bg-coal justify-end align-middle p-4 h-24 gap-x-8">

                <Image className="mr-20" src="/icons/gen3.png" layout="fixed" width="120px" height="60px" />
                <Image  src="/icons/createdby.png" layout="fixed" width="180px" height="60px" />

        </div>

    );
};

export default Footer;
