import { Box, Typography } from '@mui/material';

interface BorderComponentProp {
    title: string,
    children?: React.ReactNode;
}

const BorderComponent = ({ title, children }: BorderComponentProp) => (
    <Box sx={{ flexGrow: 1, borderWidth: "1px", borderColor: "grey", borderRadius: "4px" }}>
        <div className="grid w-full h-full bg-gray-300">
            <Typography align='center'>
                {title}
            </Typography>
        </div>
        {children}
    </Box>
);

export default BorderComponent;
