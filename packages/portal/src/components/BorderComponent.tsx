import { Box, Text } from '@mantine/core';
interface BorderComponentProp {
    title: string,
    children?: React.ReactNode;
}

const BorderComponent = ({ title, children }: BorderComponentProp) => (
    <Box className="flex-grow border border-gray-300 rounded" >
        <div className="grid w-full h-full bg-gray-300">
            <Text className='prose font-montserrat m-4 text-black' align='center' weight={400}>
                {title}
            </Text>
        </div>
        {children}
    </Box>
);

export default BorderComponent;
