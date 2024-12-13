import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import { Stack, StackProps, Text } from '@mantine/core';

interface StatisticRendererProps extends StackProps {
  value: any;
  label: string;
  key: string;
}

const defaultStatisticRenderer = ({
  value,
  label,
  key,
  ...props
}: StatisticRendererProps) => {
  return (
    <Stack {...props} key={key} align="center">
      <Text size="2rem" c="accent">
        {value}
      </Text>
      <Text size="sm" c="primary" className="uppercase">
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
