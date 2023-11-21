import { Button, LoadingOverlay, Text} from '@mantine/core';

import {
    FilterSet,
    useGetCountsQuery,
} from '@gen3/core';


interface CountsValueProps {
    readonly label: string;
    readonly index: string;
    readonly filters: FilterSet;
}

const CountsValue  = ({ label,  index, filters}: CountsValueProps) => {

    const { data, isSuccess } = useGetCountsQuery({
        type: index,
        filters: filters,
    });
// TODO handle case of data.length == 1
    return (
        <div className="mr-4">
            <LoadingOverlay visible={!isSuccess} />
            <Button color="primary" variant="filled">
                {`${data?.toLocaleString() ?? '...'} ${label}`}
            </Button>
        </div>
    );
};

export default CountsValue;
