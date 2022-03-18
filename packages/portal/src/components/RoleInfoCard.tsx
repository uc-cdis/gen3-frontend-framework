import React from 'react';
import { Card, CardContent, CardHeader, Typography, Tooltip, IconButton } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import Image from 'next/image'

export interface RoleInfoCardProp {
    icon?: string,
    tooltip?: string,
    title: string,
    content: ReadonlyArray<string>,
}

const RoleInfoCard = ({ icon = "", tooltip = "", title, content }: RoleInfoCardProp) => (
    <Card className='h-full border-6' elevation={0} sx={{  borderColor: "grey", borderRadius: "4px" }}>
        <CardHeader
            action={(tooltip) ? (
                <Tooltip title={tooltip} placement="top" arrow>
                    <IconButton>
                        <HelpIcon />
                    </IconButton>
                </Tooltip>)
                : <IconButton disabled className='!text-transparent'>
                    <HelpIcon />
                </IconButton>
            }
        />
        <CardContent>
            {icon ? <Image src={icon} alt={icon} width={60} height={60} /> : null}
            <Typography className="not-prose underline font-montserrat" >{title}</Typography>
            {content.map((element, index) => (
                <Typography className="not-prose font-montserrat" key={index} variant='body2'>{element}</Typography>
            ))}
        </CardContent>
    </Card>
);

export default RoleInfoCard;
