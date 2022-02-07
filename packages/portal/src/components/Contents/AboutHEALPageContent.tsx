import * as React from 'react';
import { useRouter } from 'next/router'
import { styled } from '@mui/material/styles';
import { Stack, Box, Grid, Typography, Card, CardMedia, Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AboutHEALPageContentProp {
    topImages: Record<any, any>;
    leftDropdowns: Record<any, any>;
    rightDropdowns: Record<any, any>;
}

const Item = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: "100%"
}));

const AboutHEALPageContent = ({ topImages, leftDropdowns, rightDropdowns }: AboutHEALPageContentProp) => {
    const { basePath } = useRouter();

    return (
        <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
            {(topImages && topImages.length > 0) ? (
                <Grid container justifyContent="space-evenly" spacing={2}>
                    {topImages.map((entry: { src: string | undefined; alt: string | undefined }) => (
                        <Grid item key={entry.alt} xs={4}>
                            <Item className='h-full'>
                                <Card className='h-full' elevation={0} sx={{ border: "none" }}>
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={`${basePath}${entry.src}`}
                                        alt={entry.alt}
                                    />
                                </Card>
                            </Item>
                        </Grid>
                    ))}
                </Grid>
            ) : null}
            <Typography className='text-center' variant="body2" gutterBottom>
                HEAL leverages data from <Link href="https://clinicaltrials.gov/" target="_blank" rel="noreferrer" >clinicaltrials.gov</Link> see <Link href="https://healdata.org/" target="_blank" rel="noreferrer" >here</Link> new studies available on the platform
            </Typography>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
                justifyContent="space-between"
                alignItems="center"
            >
                <Item className="w-full max-w-[35%]">
                    {(leftDropdowns && leftDropdowns.length > 0) ? (
                        <Grid container justifyContent="space-evenly" spacing={2}>
                            {leftDropdowns.map((entry: { title: string | undefined; content: string[]; }) => (
                                <Grid item key={entry.title} xs={6}>
                                    <Item className='h-full'>
                                        <Accordion className='h-full' defaultExpanded>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={entry.title}
                                                id={entry.title}
                                            >
                                                <Typography>{entry.title}</Typography>
                                            </AccordionSummary>
                                            {entry.content.length > 0 ?
                                                <AccordionDetails>
                                                    {entry.content.map(contentLine => (
                                                        <Typography key={contentLine} className='text-left break-words' variant="body2">- {contentLine}</Typography>
                                                    ))}
                                                </AccordionDetails>
                                                : null}
                                        </Accordion>
                                    </Item>
                                </Grid>
                            ))}
                        </Grid>
                    ) : null}
                </Item>
                <Item className="w-full max-w-[30%]">
                    <Stack
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={2}
                    >
                        <Typography className='text-center' variant="h4" gutterBottom component="div">
                            What is HEAL
                        </Typography>
                        <Typography className='text-center' variant="body1" gutterBottom component="div">
                            The Helping to End Addiction Long-term Initiative, or NIH HEAL Initiative, is an aggressive, trans-agency effort to speed scientific solutions to stem the national opioid public health crisis. Almost every NIH Institute and Center is accelerating research to address this public health emergency from all angles.
                        </Typography>
                        <Typography className='text-center' variant="body1" component="div">
                            The initiative is funding hundreds of projects nationwide.
                            Researchers are taking a variety of approaches to tackles the opioid epidemic through:
                            <ul className="list-disc text-left">
                                <li>Understanding, managing, and treating pain</li>
                                <li>Improving treatment for opioid misuse and addiction</li>
                            </ul>
                        </Typography>
                    </Stack>
                </Item>
                <Item className="w-full max-w-[35%]">
                    {(rightDropdowns && rightDropdowns.length > 0) ? (
                        <Grid container justifyContent="space-evenly" spacing={2}>
                            {rightDropdowns.map((entry: { title: string | undefined; content: string[]; }) => (
                                <Grid item key={entry.title} xs={6}>
                                    <Item className='h-full'>
                                        <Accordion className='h-full' defaultExpanded>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={entry.title}
                                                id={entry.title}
                                            >
                                                <Typography>{entry.title}</Typography>
                                            </AccordionSummary>
                                            {entry.content.length > 0 ?
                                                <AccordionDetails>
                                                    {entry.content.map(contentLine => (
                                                        <Typography key={contentLine} className='text-left break-words' variant="body2">- {contentLine}</Typography>
                                                    ))}
                                                </AccordionDetails>
                                                : null}
                                        </Accordion>
                                    </Item>
                                </Grid>
                            ))}
                        </Grid>
                    ) : null}
                </Item>
            </Stack>
        </Box>
    );
}

export default AboutHEALPageContent;
