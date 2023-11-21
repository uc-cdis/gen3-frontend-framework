import { Button, LoadingOverlay, Text} from '@mantine/core';

import {
    FilterSet,
    useGetCountsQuery,
} from '@gen3/core';


interface CountsValueProps {
    readonly label: string;
    readonly counts?: number;
    readonly isSuccess: boolean;
}

const CountsValue  = ({ label,  isSuccess, counts }: CountsValueProps) => {

// TODO handle case of data.length == 1
    return (
        <div className="mr-4">
            <LoadingOverlay visible={!isSuccess} />
            <Button color="primary" variant="filled">
                {`${counts?.toLocaleString() ?? '...'} ${label}`}
            </Button>
        </div>
    );
};

export default CountsValue;
