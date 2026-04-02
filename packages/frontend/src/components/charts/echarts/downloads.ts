import { MutableRefObject } from 'react';
import { getInstanceByDom } from 'echarts';

// Downloads functions for eCharts

/**
 * Downloads a PNG image of the current ECharts instance rendered within a specified DOM element.
 *
 * This function locates the ECharts instance inside the specified wrapper element and generates
 * a downloadable image of the chart in PNG format. If no ECharts instance is found, a warning is logged.
 *
 * @param {MutableRefObject<HTMLElement>} ref - A mutable reference pointing to the wrapper element that contains the ECharts container.
 * @param {string} filename - The desired filename (without extension) for the downloaded image.
 */

export const handleEChartsDownload = (
  ref: MutableRefObject<HTMLElement>,
  filename: string,
) => {
  // The ref points to a wrapper div — find the actual ECharts container inside it
  const chartContainer =
    ref.current.querySelector<HTMLElement>('[_echarts_instance_]') ??
    ref.current;

  const instance = getInstanceByDom(chartContainer);
  if (!instance) {
    console.warn('Could not find ECharts instance for download');
    return;
  }

  const url = instance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff',
  });

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.png`;
  a.click();
};

/**
 * Handles downloading an ECharts chart as an SVG file.
 *
 * @param {MutableRefObject<HTMLElement>} ref - A reference to the container element that holds the ECharts instance.
 * @param {string} filename - The desired filename (without extension) for the downloaded SVG file.
 */
export const handleEChartsDownloadSVG = (
  ref: MutableRefObject<HTMLElement>,
  filename: string,
) => {
  const chartContainer =
    ref.current.querySelector<HTMLElement>('[_echarts_instance_]') ??
    ref.current;

  const instance = getInstanceByDom(chartContainer);
  if (!instance) {
    console.warn('Could not find ECharts instance for download');
    return;
  }

  const url = instance.getDataURL({
    type: 'svg',
    pixelRatio: 2,
    backgroundColor: '#fff',
  });

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
};
