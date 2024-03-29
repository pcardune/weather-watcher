import Theme from 'app/Theme';

const assign = Object.assign;

// Colors
const yellow200 = '#FFF59D';
const deepOrange600 = '#F4511E';
const lime300 = '#DCE775';
const lightGreen500 = '#8BC34A';
const teal700 = '#00796B';
const cyan900 = '#006064';
const colors = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
];
const blueGrey50 = '#ECEFF1';
const blueGrey300 = '#90A4AE';
const blueGrey700 = '#455A64';
const grey900 = '#212121';
// Typography
const sansSerif = "'Roboto', 'Helvetica Neue', Helvetica, sans-serif";
const letterSpacing = 'normal';
const fontSize = 12;

// Layout
const padding = 8;
const baseProps = {
  width: 650,
  height: 200,
  padding: 40,
};

// Labels
const baseLabelStyles = {
  fontFamily: sansSerif,
  fontSize,
  letterSpacing,
  padding,
  fill: Theme.colors.secondaryText,
};

const centeredLabelStyles = assign({textAnchor: 'middle'}, baseLabelStyles);

// Strokes
const strokeDasharray = '1';
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

// Put it all together...
export default {
  area: {
    style: {
      data: {
        fill: grey900,
      },
      labels: centeredLabelStyles,
    },
    ...baseProps,
  },
  axis: assign(
    {
      style: {
        axis: {
          fill: 'transparent',
          stroke: blueGrey300,
          strokeWidth: 2,
          strokeLinecap,
          strokeLinejoin,
        },
        axisLabel: assign({}, centeredLabelStyles, {
          padding,
          stroke: 'transparent',
        }),
        grid: {
          fill: 'transparent',
          stroke: Theme.colors.divider,
          strokeDasharray,
          strokeLinecap,
          strokeLinejoin,
        },
        ticks: {
          fill: 'transparent',
          size: 5,
          stroke: blueGrey300,
          strokeWidth: 1,
          strokeLinecap,
          strokeLinejoin,
        },
        tickLabels: assign({}, baseLabelStyles, {
          fill: Theme.colors.secondaryText,
          stroke: 'transparent',
        }),
      },
    },
    baseProps
  ),
  bar: assign(
    {
      style: {
        data: {
          fill: blueGrey700,
          padding,
          stroke: 'transparent',
          strokeWidth: 0,
          width: 5,
        },
        labels: baseLabelStyles,
      },
    },
    baseProps
  ),
  candlestick: assign(
    {
      style: {
        data: {
          stroke: blueGrey700,
        },
        labels: centeredLabelStyles,
      },
      candleColors: {
        positive: '#ffffff',
        negative: blueGrey700,
      },
    },
    baseProps
  ),
  chart: baseProps,
  errorbar: assign(
    {
      style: {
        data: {
          fill: 'transparent',
          opacity: 1,
          stroke: blueGrey700,
          strokeWidth: 2,
        },
        labels: assign({}, centeredLabelStyles, {
          stroke: 'transparent',
          strokeWidth: 0,
        }),
      },
    },
    baseProps
  ),
  group: assign(
    {
      colorScale: colors,
    },
    baseProps
  ),
  line: assign(
    {
      style: {
        data: {
          fill: 'transparent',
          opacity: 1,
          stroke: blueGrey700,
          strokeWidth: 2,
        },
        labels: assign({}, baseLabelStyles, {
          stroke: 'transparent',
          strokeWidth: 0,
          textAnchor: 'start',
        }),
      },
    },
    baseProps
  ),
  pie: assign(
    {
      colorScale: colors,
      style: {
        data: {
          padding,
          stroke: blueGrey50,
          strokeWidth: 1,
        },
        labels: assign({}, baseLabelStyles, {
          padding: 20,
          stroke: 'transparent',
          strokeWidth: 0,
        }),
      },
    },
    baseProps
  ),
  scatter: assign(
    {
      style: {
        data: {
          fill: blueGrey700,
          opacity: 1,
          stroke: 'transparent',
          strokeWidth: 0,
        },
        labels: assign({}, centeredLabelStyles, {
          stroke: 'transparent',
        }),
      },
    },
    baseProps
  ),
  stack: assign(
    {
      colorScale: colors,
    },
    baseProps
  ),
  tooltip: assign(
    {
      style: {
        data: {
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
        },
        labels: centeredLabelStyles,
        flyout: {
          stroke: blueGrey700,
          strokeWidth: 1,
          fill: '#f0f0f0',
        },
      },
      flyoutProps: {
        cornerRadius: 10,
        pointerLength: 10,
      },
    },
    baseProps
  ),
  voronoi: assign(
    {
      style: {
        data: {
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
        },
        labels: centeredLabelStyles,
      },
    },
    baseProps
  ),
};
