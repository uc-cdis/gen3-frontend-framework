import React, { useMemo, useState } from 'react';
import ReactECharts, { ReactEChartsProps } from '../../components/charts/echarts/ReactECharts';
import type { TreeSeriesOption } from 'echarts';
import { formatDataForGraph } from './graphViewDataUtils';
import { DataDictionary } from './types';

interface GraphViewType {
  categories: string;
  dictionary: DataDictionary,
  selectedId: string;
}

const GraphView = ({
  categories,
  dictionary,
  selectedId,
}: GraphViewType) => {
  const [zoomLevel, setZoomLevel] = useState(0); // TODO Start here for zoom level
  const dataAndLinks = formatDataForGraph(dictionary);
  console.log('GraphView dictionary', dictionary);
  console.log('GraphView categories', categories);
  console.log('GraphView selectedId', selectedId);
  interface TreeReactEChartsProps extends ReactEChartsProps {
    option: {
      series: TreeSeriesOption[];
    };
  }

  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      toolbox: {
        show: true,
        left: 'left',
        orient: 'vertical',
        itemSize: 30,
        iconStyle: {
          borderWidth: 0,
          opacity: 0.8,
        },
        emphasis: {
          iconStyle: {
            opacity: 1,
            color: '#3283c8',
          }
        },
        feature: {
          restore: { 
            show: true, 
            title: 'Reset',
            icon: 'image://data:image/gif;base64,R0lGODlhHgAeAKEAADKDyP///zKDyDKDyCH5BAEKAAIALAAAAAAeAB4AAAJChI+py+0Powm02irP3TRPfnkAJjZkuZxooq5a57Jw/AY00sY5lO+PjwKWhCKix5hBSpQRJm+2BFmKUueoCr1pt5ICADs=',
          },
          myZoomIn: {
            show: true,
            title: 'Zoom In',
            icon: 'image://data:image/gif;base64,R0lGODlhHgAeAKEAADKDyP///zKDyDKDyCH5BAEKAAIALAAAAAAeAB4AAAJAhI+py+0PIww0yFnvq1Y37n1ZuICkYp5Iqhps+27cTNfdauc0qvcU79NpYiciyRhCepTDUcvlfDIvU0n1ic2GCgA7',
            onclick: (params: TreeReactEChartsProps) => {
              const series = params?.option?.series;
              const zoom = series && series[0] ? series[0].zoom : 1;

              setZoomLevel((zoom || 1) + 0.1);
            }
          },
          myZoomOut: {
            show: true,
            title: 'Zoom Out',
            icon: 'image://data:image/gif;base64,R0lGODlhHgAeAKEAADKDyP///zKDyDKDyCH5BAEKAAIALAAAAAAeAB4AAAIohI+py+0Po5y02ouz3rz7PwXiSJbmqJzqmq4u2b4vSNf2jef6zvd1AQA7',
            onclick: (params: TreeReactEChartsProps) => {
              const series = params?.option?.series;
              const zoom = series && series[0] ? series[0].zoom : 1;

              setZoomLevel((zoom || 1) - 0.1);
            }
          },
        },
      },
      //https://echarts.apache.org/en/option.html#legend
      series: {
        type: 'graph',
        roam: true,
        zoom: zoomLevel,
        label: {
          show: true,
          position: 'right',
          backgroundColor: 'white',
        },
        symbol: 'circle',
        emphasis: {
          focus: 'adjacency'
        },
        //edgeSymbol: ['circle', 'circle'],
        //edgeSymbolSize: [4, 4],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0,
          cap: 'square',
        },

        //https://echarts.apache.org/en/option.html#series-tree.data
        data: dataAndLinks.data,
        links: dataAndLinks.links,

        top: '10%',
        left: '5%',

      }
    };
  }, [dataAndLinks, zoomLevel]);
//TODO: import real data
//TODO: connections between nodes
//TODO: ZOOM IN AND OUT AND MOVE AROUND controls? 
  return (
    <div className="w-full h-full min-h-[800px]">
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default GraphView;
