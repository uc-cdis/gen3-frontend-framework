import * as React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

import { Title } from '@mantine/core';

import { MdFormatQuote, MdOutlineSearch, MdOutlineBarChart, MdGroup } from 'react-icons/md';
import { FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa';


import { RoleContentEntry } from "./RolesPageContent";

export interface LandingPageContentProp {
    rolesPages: Record<string, RoleContentEntry>
}

const LandingPageContent = ({ rolesPages }: LandingPageContentProp) => {
    const { basePath } = useRouter();

    return (
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl my-10 text-heal-dark_gray'>
            <Title  className='mx-20' order={2}>HEAL Platform</Title>
            <div className='flex mx-20'>
                <div className='basis-1/2 pr-10'>
                    <div className=''>
                        <p className='!mt-0'>
                            The <strong>HEAL Platform</strong> is a cloud-based web interface that provides a secure environment for discovery and analysis of NIH HEAL <strong>results and data.</strong>
                        </p>
                        <a className='heal-btn' href='/discovery'>Explore HEAL Data</a>
                    </div>
                    <div className=''>
                        <p>
                            The Helping to End Addiction Long-term Initiative, or <strong>NIH HEAL Initiative</strong>, is an aggressive, trans-agency effort to speed scientific solutions to stem the national opioid and pain public health crisis.
                        </p>
                        <a className='heal-btn' href='//heal.nih.gov' target='_blank' rel="noreferrer">                            <FaExternalLinkAlt className='inline-block pb-1 pr-1' title='External Link'/> Learn More</a>
                    </div>
                </div>
                <div className='basis-1/2'>
                    <Image
                        src={`${basePath}/images/HEAL_Initiative.jpeg`}
                        alt="HEAL initiative"
                        width={1260}
                        height={630}
                        layout='intrinsic'
                    />
                </div>
            </div>
            <hr className='border'/>
            <div className='text-center'>
                <Title  className='' order={3}>What can you expect to do on the HEAL Platform?</Title>
                <ul className='gap-4 mx-20 !p-0'>
                {[
                    [MdOutlineSearch, 'Search datasets from HEAL research.', 'Discover', '/discovery'],
                    [MdOutlineBarChart, 'Export and analyze datasets on the fly.', 'Explore Tutorial and Example Analysis', '/example'],
                    [MdGroup, 'Explore how to get involved with the community.', 'Community', '/community'],
                    [FaGraduationCap, 'Learn about new findings in HEAL research.', 'Learn', '/learn'],
                ].map(([icon, bodyText, btnText, link], index) => (
                    <li key={index} className='border shadow-lg !p-5 w-1/5 inline-block mx-5 align-top'>
                        {React.createElement(icon, {title:`${btnText} icon`, className:'inline-block text-7xl text-heal-magenta'}) }
                        <p className='block text-gen3-titanium leading-6 h-20'>{bodyText}</p>
                        <a href={`${link}`} className='heal-btn heal-btn-rev'>{btnText}</a>
                    </li>
                ))}
                </ul>
            </div>
            <div className='bg-heal-light_purple p-20 text-center mt-20'>
                <div className='text-4xl'><MdFormatQuote title='quotation mark' className='inline rotate-180 text-5xl mb-2'/>Data is both a product of research, and also an engine for new discovery. <MdFormatQuote title='quotation mark' className='inline text-5xl mt-2'/></div>
                <div className=''>REBECCA G. Baker, Ph.D., Director of the NIH HEAL Initiative</div>
            </div>
        </div>
    );
}

export default LandingPageContent;
