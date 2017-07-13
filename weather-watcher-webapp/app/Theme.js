import {css} from 'styled-components';

const sizes = {
  phone: 450,
};

export default {
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
