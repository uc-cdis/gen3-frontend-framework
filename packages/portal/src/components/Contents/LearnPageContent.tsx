import React from "react";
import { useRouter } from 'next/router'
import tw from "tailwind-styled-components"
import { Box, Grid, Group, Text } from '@mantine/core';
import RoleInfoCard from "../RoleInfoCard";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

export interface LearnPageConfig {
    readonly title: string;
    readonly introduction?: ReadonlyArray<{
        type: "text" | "link",
        content: string,
        link?: string
    }>;
    readonly content: ReadonlyArray<{title: string, linkText: string, content: string, link: string}>;
}

const Item = tw.div`h-100 text-center p-2`

const LearnPageContent = ({title, introduction, content}: LearnPageConfig) => {

    return (
        <Grid gutter={40} columns={20} justify="flex-start">
            <Grid.Col span={20}>
                <Text className="text-5xl font-medium text-heal-primary mt-5 text-center">{title}</Text>
            </Grid.Col>
            {
                content.map(
                    ({title, content, linkText, link}) => (
                        <Grid.Col span={4} className='border shadow-lg p-5 m-10 flex flex-col justify-between justify-items-end'>
                            <Text className="font-bold text-xl text-heal-secondary">{title}</Text>
                            <Text className=" mb-3">{content}</Text>
                            <div className="flex flex-row justify-center">
                            <a href={link} className='heal-btn  w-[60%]' target='_blank' rel="noreferrer">
                                <span className="flex flex-row">
                                    <FaExternalLinkAlt className="mr-2"/>
                                    {linkText}
                                </span>
                            </a>
                            </div>
                        </Grid.Col>
                    )
                )
            }
        </Grid>

    );
}

export default LearnPageContent;
