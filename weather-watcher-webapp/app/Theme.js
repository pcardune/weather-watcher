import {createMuiTheme} from 'material-ui/styles';
import {grey, amber} from 'material-ui/colors';
import {css} from 'styled-components';

const sizes = {
  phone: 450,
};

const darkGrey = {
  '50': grey['100'],
  '100': grey['200'],
  '200': grey['300'],
  '300': grey['400'],
  '400': grey['500'],
  '500': grey['600'],
  '600': grey['700'],
  '700': grey['800'],
  '800': grey['900'],
  '900': 'black',
  A100: grey['A100'],
  A200: grey['A200'],
  A400: grey['A400'],
  A700: grey['A700'],
  contrastDefaultColor: 'light',
};

const darkAmber = {
  '50': amber['100'],
  '100': amber['200'],
  '200': amber['300'],
  '300': amber['400'],
  '400': amber['500'],
  '500': amber['600'],
  '600': amber['700'],
  '700': amber['800'],
  '800': amber['900'],
  '900': 'black',
  A100: amber['A100'],
  A200: amber['A200'],
  A400: amber['A400'],
  A700: amber['A700'],
  contrastDefaultColor: 'light',
};

export const MuiTheme = createMuiTheme({
  palette: {
    primary: darkGrey,
    secondary: darkAmber,
  },
  drawerWidth: 240,
  overrides: {
    MuiToolbar: {
      root: {
        backgroundColor: darkGrey[500],
        color: 'white',
      },
    },
  },
});

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
