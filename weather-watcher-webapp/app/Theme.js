import {css} from 'styled-components';

const sizes = {
  phone: 450,
};

export default {
  // colors taken from the Material UI Color Palette
  // https://material.io/guidelines/style/color.html#color-color-palette
  colors: {
    primaryDark: '#1976D2',
    primary: '#2196F3',
    primaryLight: '#BBDEFB',
    textOnPrimary: '#FFFFFF',
    accent: '#FFC107',
    textOnAccent: '#212121',
    primaryText: '#212121',
    secondaryText: '#757575',
    divider: '#BDBDBD',
    forecastGood: '#c5e1a5',
    forecastOK: '#ffe082',
    forecastBad: '#ef9a9a',
  },
  colorClass: {
    primary: 'grey darken-1',
    primaryDark: 'grey darken-2',
    accent: 'amber',
    textOnAccent: 'grey-text text-darken-2',
  },
  shadows: {
    level1: '0 0 2px 0 rgba(0,0,0,.3), 0 2px 2px 0 rgba(0,0,0,.4)',
    level4: '0 0 24px 0 rgba(0,0,0,.3), 0 24px 24px 0 rgba(0,0,0,.4)',
  },
  padding: {
    standard: '25px',
  },
  media: {
    phone: (...args) => css`
      @media (max-width: ${sizes.phone / 16}em) {
        ${css(...args)}
      }
    `,
    desktop: (...args) => css`
      @media (min-width: ${(sizes.phone + 1) / 16}em) {
        ${css(...args)}
      }
    `,
  },
};
