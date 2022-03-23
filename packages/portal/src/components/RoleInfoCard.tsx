import React from 'react';
import {Button, Card, Tooltip, Title, Text} from '@mantine/core';
import HelpIcon from '@mui/icons-material/Help';
import Image from 'next/image'

export interface RoleInfoCardProp {
    icon?: string,
    tooltip?: string,
    title: string,
    content: ReadonlyArray<string>,
}

const RoleInfoCard = ({ icon = "", tooltip = "", title, content }: RoleInfoCardProp) => (
    <Card className='h-full border-6 rounded' shadow="sm" sx={{borderColor: "grey"}}>
        <Card.Section>
            {tooltip?
                <Tooltip title={tooltip} placement="top" arrow>
                    <Button leftIcon={<HelpIcon/>}/>
                </Tooltip>
            :
            <Button disabled className='!text-transparent' />
            }
            </Card.Section>
        <Card.Section>
            {icon ? <Image src={icon} alt={icon} width={60} height={60} /> : null}
            <Title className="not-prose underline font-montserrat" >{title}</Title>
            {content.map((element, index) => (
                <Text className="not-prose font-montserrat" key={index}>{element}</Text>
            ))}
        </Card.Section>
    </Card>
);

export default RoleInfoCard;
