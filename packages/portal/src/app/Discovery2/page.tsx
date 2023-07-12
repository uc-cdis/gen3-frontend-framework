'use client'

import Discovery from '@/components/Discovery/Discovery';
import { DiscoveryPageProps } from './types';

const DiscoveryPage2 = ({
  columns,
  dataURL,
}: DiscoveryPageProps) : JSX.Element => {
  return (
      <Discovery columns={columns} dataURL={dataURL} />
  );
};


export default DiscoveryPage2;
