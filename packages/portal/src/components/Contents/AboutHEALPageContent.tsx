import * as React from 'react';
import { useRouter } from 'next/router';
import tw from "tailwind-styled-components"
import { Title, Image } from '@mantine/core';

import { MdArrowForward } from 'react-icons/md';
import { FaExternalLinkAlt } from 'react-icons/fa';

export interface ImageEntry {
    readonly src: string;
    readonly alt: string;
}

export interface DropdownEntry {
    readonly title: string;
    readonly content: ReadonlyArray<string>;
}

export interface AboutHEALPageContentProp {
    topImages: ReadonlyArray<ImageEntry>;
    leftDropdowns: ReadonlyArray<DropdownEntry>;
    rightDropdowns: ReadonlyArray<DropdownEntry>;
}

const Link = tw.a`text-heal-blue
    text-3xl
    font-bold
    inline-block
    w-max
    p-6
    border
    shadow-lg
    hover:underline
    hover:border-heal-medium_gray`;

const AboutHEALPageContent = ({ topImages, leftDropdowns, rightDropdowns }: AboutHEALPageContentProp) => {
    const { basePath } = useRouter();
    //not using propeties at this time, but will leave them for the future when we hopfully make this more of a template
    return (
        <div className="flex-grow p-4 h-100" >
            <Title className='' order={1}>About the Data Platform</Title>
            <div className='mx-10 w-3/4'>
                <p className=''>The HEAL Platform is a cloud-based and multifunctional web interface that provides a secure environment for <strong>discovery and analysis of NIH HEAL results and data.</strong></p>

                <p className='text-center'>
                    <Link href='/discovery'><MdArrowForward className='inline-block mb-1' title='Forward Arrow'/>Discover datasets</Link>
                </p>

                <p className=''>The HEAL Platform is designed to serve users with a <strong>variety of objectives, backgrounds, and specialties.</strong></p>

                <p className='text-center'>
                    <Link href='//heal.nih.gov/research'><MdArrowForward className='inline-block mb-1' title='Forward Arrow'/>Learn about HEAL research at heal.nih.gov</Link>
                </p>

                <p className=''>The HEAL Platform represents a dynamic Data Ecosystem that aggregates and hosts <strong>data from multiple secure repositories.</strong></p>

                <p className='text-center'>
                    <Image classNames={{
                        root: 'w-1/4 inline-block',
                        figure: '!m-0',
                        image: '!m-0'
                        }} src="/images/heal_bubble.png" alt="Heal Platform circle surrounded by smaller non legible circles" />
                </p>

                <p className=''>The HEAL platform offers a secure and <strong>cost-effective cloud-computing environment for data analysis,</strong> empowering collaborative research and development of new analytical tools.</p>

                <p className='text-center'>
                    <Link href='/workspace'><MdArrowForward className='inline-block mb-1' title='Forward Arrow'/>Explore our workspaces</Link>
                </p>
            </div>
            <Title className='' order={2}>For Data Submitters</Title>
            <div className='mx-10 w-3/4'>
                <p className=''>All data that is made available on the HEAL Platform is part of the NIH infrastructure that underlies the HEAL Public Access and Data Sharing Policy.</p>

                <p className='text-center'>
                    <Link href=''><MdArrowForward className='inline-block mb-1' title='Forward Arrow'/>Read the HEAL Public Access and Data Sharing Policy</Link>
                </p>

                <p className=''>Data submitters should contact the following resources to get further guidance and how-to guides:</p>

                <ul>
                {[
                    ['healdatafair.org', '//www.healdatafair.org/'],
                    ['NIH HEAL Initiative', '//heal.nih.gov/data/heal-data-ecosystem'],
                ].map(([text, link], index) => (
                    <li key={index} className='!m-0'>
                        <a className='font-bold text-heal-blue hover:underline' href={link} target='_blank' rel='noreferrer'>
                            <FaExternalLinkAlt className='inline-block pb-1 pr-1' title='External Link'/>
                            {text}
                        </a>
                    </li>
                ))}
                </ul>
            </div>
            <Title className='' order={2}>HEAL Platform is powered by</Title>
            <div className='mx-10 w-3/4'>
                <p className=''>The HEAL Platform is powered by the <strong>Gen3</strong> Data Commons Software Stack developed by the <a className='font-bold text-heal-blue hover:underline' href="//ctds.uchicago.edu/" target="_blank"  rel='noreferrer'>Center for Translational Data Science</a> at the University of Chicago.</p>
                <p className='text-center'>
                    <a href='//gen3.org/' target='_blank' rel='noreferrer'>
                        <Image classNames={{
                            root: 'w-1/6 inline-block',
                            figure: '!m-0',
                            image: '!m-0'
                            }} src="/icons/gen3blue.png" alt="GEN3" />
                    </a>
                </p>
            </div>
        </div>
    );
}

export default AboutHEALPageContent;
