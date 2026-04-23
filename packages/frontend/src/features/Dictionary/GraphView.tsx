import React, { useMemo, useState } from 'react';
import ReactECharts, { ReactEChartsProps } from '../../components/charts/echarts/ReactECharts';
import type { GraphSeriesOption } from 'echarts';
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const dataAndLinks = formatDataForGraph(dictionary);
  console.log('GraphView dictionary', dictionary);
  console.log('GraphView categories', categories);
  console.log('GraphView selectedId', selectedId);
  interface GraphReactEChartsProps extends ReactEChartsProps {
    option: {
      series: GraphSeriesOption[];
    };
  }

  //TODO list
  //position labels
  //line strait up and down
  //curves at end of line 
  //positioning of nodes
  //positioning of lines
  //icones
  //icon images
  //line color
  //lines that curve back in last row
  //hover upstreem only emphasis

  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      toolbox: {
        show: true,
        left: 16,
        top: 16,
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
            onclick: (params: GraphReactEChartsProps) => {
              const series = params?.option?.series;
              const zoom = series && series[0] ? series[0].zoom : 1;

              setZoomLevel((zoom || 1) + 0.1);
            }
          },
          myZoomOut: {
            show: true,
            title: 'Zoom Out',
            icon: 'image://data:image/gif;base64,R0lGODlhHgAeAKEAADKDyP///zKDyDKDyCH5BAEKAAIALAAAAAAeAB4AAAIohI+py+0Po5y02ouz3rz7PwXiSJbmqJzqmq4u2b4vSNf2jef6zvd1AQA7',
            onclick: (params: GraphReactEChartsProps) => {
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
        nodeScaleRatio: 1 as 0.6,//Temp type fix untill its fixed in echarts
        label: {
          show: true,
          position: 'right',
          align: 'left',
          verticalAlign: 'middle',
          backgroundColor: 'white',
          fontSize: 12 * zoomLevel, //have label size increase with zoom
        },
        symbol: 'circle', //TODO make image
        symbolSize: 15,
        symbolOffset: ['-50%', 0],
        emphasis: {
          focus: 'adjacency'
        },
        edgeSymbol: ['circle', 'circle'],
        edgeSymbolSize: 6 * zoomLevel, //have edge size increase with zoom
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0,
          cap: 'square',
        },

        //https://echarts.apache.org/en/option.html#series-tree.data
        data: dataAndLinks.data,
        links: dataAndLinks.links,

        top: 100,
        left: 100,

      }
    };
  }, [dataAndLinks, zoomLevel]);
  return (
    <div className="w-full h-full min-h-[800px]">
      <ReactECharts option={chartDefinition} events={{
        graphroam: function () {
          //getting zoom from event does not work, so get it from chart options
          const thisApi = this._api as unknown as { getOption: () => any };
          const thisOptions: GraphReactEChartsProps['option'] = thisApi.getOption();
          const seriesGraph = thisOptions?.series && thisOptions.series[0];
          const seriesGraphZoom = seriesGraph?.zoom;
          if (seriesGraphZoom){
            setZoomLevel(seriesGraphZoom);
          }
        },
      }} />
    </div>
  );
};

export default GraphView;
