import React from "react";
import { useRouter } from 'next/router'
import tw from "tailwind-styled-components"
import { Box, Grid, Group, Text } from '@mantine/core';

export interface LearnPageConfig {
    readonly title: string;
    readonly introduction?: ReadonlyArray<{
        type: "text" | "link",
        content: string,
        link?: string
    }>;
    readonly content: ReadonlyArray<{title: string, linkText: string, link: string}>;
}

const Item = tw.div`h-100 text-center p-2`

const LearnPageContent = ({title, introduction, content}: LearnPageConfig) => {
    const { basePath } = useRouter();
    // console.log(title, introduction, content);
    return (
        <>
            <h1>{title}</h1>
            <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
                {
                    <Grid className="mx-6" gutter="xl" >
                        {
                            // rolesPages.content.forEach
                        }
                    </Grid>
                //     (rolesPages[rolePageKey] && rolesPages[rolePageKey].content && rolesPages[rolePageKey].content.length > 0) ? (
                //     <Grid className="mx-6" gutter="xl" >
                //         {rolesPages[rolePageKey].content.map((entry: RoleInfoCardProp) => (
                //             <Grid.Col key={entry.title} xs={4}>
                //                 <Item className='h-full'>
                //                     <RoleInfoCard
                //                         icon={`${basePath}${entry.icon}`}
                //                         tooltip={entry.tooltip}
                //                         title={entry.title}
                //                         content={entry.content}
                //                     />
                //                 </Item>
                //             </Grid.Col>
                //         ))}
                //     </Grid>
                // ) : null} */
                }
            </Box>
        </>
    );
}

export default LearnPageContent;
