import { Box, Text } from '@mantine/core';
import HighlightSearchTerm from '../SearchHighlighting/HighlightSearchTerm';
import { MRT_Row, MRT_RowData } from 'mantine-react-table';
import { DiscoveryIndexConfig } from '../../types';
import _ from 'lodash';

interface RenderDetailPanelProps {
  row: MRT_Row<MRT_RowData>;
  config: DiscoveryIndexConfig;
  searchTerm: string;
}

const RenderDetailPanel = ({
  row,
  config,
  searchTerm,
}: RenderDetailPanelProps) => {
  if (config.studyPreviewField) {
    const studyPreviewData = _.get(
      row.original,
      config.studyPreviewField.field,
    );
    return (
      <Box display={'flex'} w={'100%'}>
        <Text size="xs" lineClamp={2}>
          {HighlightSearchTerm(studyPreviewData, searchTerm)}
        </Text>
      </Box>
    );
  } else {
    return undefined;
  }
};

export default RenderDetailPanel;
