import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import { Stack, StackProps, Text } from '@mantine/core';

interface StatisticRendererProps extends StackProps {
  value: any;
  label: string;
}

const defaultStatisticRenderer = ({
  value,
  label,
  ...props
}: StatisticRendererProps) => {
  return (
    <Stack {...props} align="center">
      <Text size="2rem" color="accent">
        {value}
      </Text>
      <Text size="sm" color="primary">
        {label}
      </Text>
    </Stack>
  );
};

const DefaultRendererCatalog = {
  string: {
    default: defaultStatisticRenderer,
  },
};

let instance: RenderFactoryTypedInstance<StatisticRendererProps>;

const StatisticRendererFactory =
  (): RenderFactoryTypedInstance<StatisticRendererProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<StatisticRendererProps>();
      instance.registerRendererCatalog(DefaultRendererCatalog);
    }
    return instance;
  };

export default StatisticRendererFactory;
