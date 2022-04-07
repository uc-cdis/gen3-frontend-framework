import * as React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

import { Title, Button } from '@mantine/core';

import { MdFormatQuote, MdOutlineBarChart, MdGroup, MdCloudDownload, MdOutlineSearch } from 'react-icons/md';
import { FaGraduationCap } from 'react-icons/fa';


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
                <div className='basis-1/2'>
                    <div className=''>
                        <p className='!mt-0'>
                            The Helping to End Addiction Long-term Initiative, or <strong>NIH HEAL Initiative</strong>, is an aggressive, trans-agency effort to speed scientific solutions to stem the national opioid public health crisis.
                        </p>
                        <Button className='heal-btn'>HEAL Platform</Button>
                    </div>
                    <div className=''>
                        <p>
                            The Helping to End Addiction Long-term Initiative, or <strong>NIH HEAL Initiative</strong>, is an aggressive, trans-agency effort to speed scientific solutions to stem the national opioid and pain public health crisis.
                        </p>
                        <Button className='heal-btn'>NIH HEAL Inititative</Button>
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
            <div className='bg-heal-light_purple p-20 text-center mt-20'>
                <div className='text-4xl'><MdFormatQuote title='quotation mark' className='inline rotate-180 text-5xl mb-2'/>Data is both a product of research, and also an engine for new discovery. <MdFormatQuote title='quotation mark' className='inline text-5xl mt-2'/></div>
                <div className=''>DR. REBECCA G. Baker, Ph.D., director of the NIH HEAL Initiative</div>
            </div>
            <div className='text-center'>
                <Title  className='' order={3}>What can you expect to do on the HEAL Platform?</Title>
                <ul className='flex  gap-4 mx-20 !p-0'>
                {[
                    [MdOutlineSearch, 'Search datasets from HEAL research.', 'Discover'],
                    [MdCloudDownload, 'Download datasets in two clicks.', 'Download'],
                    [MdOutlineBarChart, 'Export and analyze datasets on the fly.', 'Analyze'],
                    [MdGroup, 'Explore how to get involved with the community.', 'Community'],
                    [FaGraduationCap, 'Learn about new findings in HEAL research.', 'Learn'],
                ].map(([icon, bodyText, btnText], index) => (
                    <li key={index} className='border basis-1/5 shadow-lg !p-5'>
                        {React.createElement(icon, {title:`${btnText} icon`, className:'inline-block text-7xl text-heal-magenta'}) }
                        <p className='block text-gen3-titanium leading-6 h-20'>{bodyText}</p>
                        <Button className='heal-btn heal-btn-rev'>{btnText}</Button>
                    </li>
                ))}
                </ul>
            </div>
            <hr className='border'/>
            <div className='text-center'>
                <Title  className='' order={3}>HEAL Platform Studies and Updates</Title>
                <ul className='flex  gap-4 mx-20 !p-0'>
                {[
                    [645, 'Studies'],
                    [68, 'Medication Treatment'],
                    [65, 'Young Adult'],
                    [59, 'Overdose'],
                    [44, 'Practice'],
                    [37, 'Mental Health'],
                ].map(([numberOfStudies, studyTitle], index) => (
                    <li key={index} className='!p-5 basis-1/6'>
                        <div className='text-heal-magenta text-3xl font-bold'>{numberOfStudies}</div>
                        <div className='leading-6 mt-2'>{studyTitle}</div>
                    </li>
                ))}
                </ul>
                <div className='mx-20'>
                    <style>{'.carousel > .control-dots {left:-25%;} .carousel > .control-dots > .dot {height:20px;width:20px;}'}</style>
                    <Carousel showStatus={false} showThumbs={false}>
                        <div className='flex h-[500px]'>
                            <div className='text-white bg-gradient-to-b from-[#6999C3] to-[#293762] basis-1/2'>
                                <Title  className='!my-[50px]' order={3}>Press and Data Releases</Title>
                                <div className=''>
                                    Browse latest news, research <br/>discoveries, and updates on the <br/>HEAL Platform.
                                </div>
                                <Button className='mt-10 bg-[#26375A] ' radius="md" size='lg'>Learn more &gt;&gt;</Button>
                            </div>
                            <div className='basis-1/2'>
                                Table 1 Here
                            </div>
                        </div>
                        <div className='flex h-[500px]'>
                            <div className='text-white bg-gradient-to-b from-[#6999C3] to-[#293762] basis-1/2'>
                                <Title  className='!my-[50px]' order={3}>Recently Added Data</Title>
                                <div className=''>
                                    Find recently uploaded data files<br/> and studies to help find new<br/> treatments for pain and addiction.
                                </div>
                            </div>
                            <div className='basis-1/2'>
                                Table 2 Here
                            </div>
                        </div>
                    </Carousel>
                </div>
            </div>
            <hr className='border'/>
            <div className='text-center'>
                <Title  className='' order={3}>What data is stored on the HEAL Platform?</Title>
                <div className='flex gap-56 mx-56'>
                    <div className='basis-1/2'>
                        <dl className=''>
                        {[
                            ['Our data is FAIR', (<><strong>F</strong>indable, <strong>A</strong>ccessible, <strong>I</strong>nteroperable, and <strong>R</strong>eusable.</>)],
                            ['Data Types', (<>High-level study data or metadata, data files, and file metadata.</>)],
                            ['Data Categories', (<>Clinical studies, public records, statistics, &quot;omics&quot;, imaging, and surveys.</>)],
                            ['Research', (<>Experimental, clinical, epidemiologic, observational, and basic research.</>)],
                        ].map(([title, definition], index) => (<>
                            <dt key={`${index}-dt`} className='text-xl font-bold'>{title}:</dt>
                            <dd key={`${index}-dd`} className='text-lg mb-8'>{definition}</dd>
                        </>))}
                        </dl>
                    </div>
                    <div className='basis-1/2'>
                        {/*Bubble cloud*/}
                        <ul className='relative text-white font-bold !pl-0'>
                            {[
                                {label: 'Biosamples', fontSize: 16, bgcolor: '#981F32',w:113,t:27,l:39},
                                {label:'Behavior', fontSize: 14, bgcolor: '#D30021', w:97,t:0,l:149},
                                {label:'Public Records', fontSize: 13, bgcolor: '#532565', w:68,t:45,l:243},
                                {label:'Bio- metrics', fontSize: 13, bgcolor: '#772896', w:68,t:3,l:299},

                                {label:'Animal Behavior', fontSize: 14, bgcolor: '#982568', w:97,t:131,l:0},
                                {label:'Demographics', fontSize: 24, bgcolor: '#E07C3E', w:226,t:99,l:97},
                                {label:'Health Records', fontSize: 16, bgcolor: '#C14F09', w:105,t:72,l:300},
                                {label:'Actigraphy', fontSize: 16, bgcolor: '#BF362E', w:118,t:36,l:405},

                                {label:'Drug Screening', fontSize: 13, bgcolor: '#570B74', w:79,t:229,l:26},
                                {label:'Micro- scopy', fontSize: 12, bgcolor: '#130E50', w:56,t:181,l:324},
                                {label:'Proteomics', fontSize: 14, bgcolor: '#BF362E', w:98,t:150,l:381},
                                {label:'Genetics', fontSize: 14, bgcolor: '#BA1073', w:80,t:237,l:435},

                                {label:'Site-Specific', fontSize: 16, bgcolor: '#AA1A11', w:120,t:302,l:51},
                                {label:'Transcrip- tomics', fontSize: 8, bgcolor: '#3F0A4E', w:40,t:327,l:174},
                                {label:'Electro- physiology', fontSize: 14, bgcolor: '#931125', w:97,t:318,l:216},
                                {label:'Imaging', fontSize: 24, bgcolor: '#E07C3E', w:142,t:237,l:300},

                                {label:'Trial Meta Analysis', fontSize: 8, bgcolor: '#500E4D', w:41,t:374,l:315},
                                {label:'PK', fontSize: 14, bgcolor: '#6F1549', w:80,t:322,l:431}
                            ].map(({label, fontSize, bgcolor, w, t, l}, index) => (
                                <li key={index} style={{
                                    fontSize: fontSize,
                                    lineHeight: '1em',
                                    backgroundColor: bgcolor,
                                    margin: 0,
                                    borderRadius: w,
                                    height: w,
                                    width: w,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    top: t,
                                    left: l,
                                    padding: 0,
                                }}><span>{label}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Button className='heal-btn heal-btn-rev'>Learn how we curate datasets.</Button>
            </div>
            <div className='bg-heal-light_purple p-20 text-center mt-20'>
                <div className='text-4xl'><MdFormatQuote title='quotation mark' className='inline rotate-180 text-5xl mb-2'/>We are determine to put an end to our nation&apos;s opioid crisis.<MdFormatQuote title='quotation mark' className='inline text-5xl mt-2'/></div>
                <div className=''>DR. FRANICS Collins, Ph.D., former director of the NIH</div>
            </div>
        </div>
    );
}

export default LandingPageContent;
