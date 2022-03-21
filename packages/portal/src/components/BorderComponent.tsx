import { Box, Text } from '@mantine/core';
interface BorderComponentProp {
    title: string,
    children?: React.ReactNode;
}

const BorderComponent = ({ title, children }: BorderComponentProp) => (
    <Box sx={{ flexGrow: 1, borderWidth: "1px", borderColor: "grey", borderRadius: "4px" }}>
        <div className="grid w-full h-full bg-gray-300">
            <Text className='font-montserrat' align='center'>
                {title}
            </Text>
        </div>
        {children}
    </Box>
);

export default BorderComponent;
