import {css} from 'styled-components';

const sizes = {
  desktop: 992,
  tablet: 768,
  phone: 376,
};

// Iterate through the sizes and create a media template
const media = Object.keys(sizes).reduce(
  (acc, label) => {
    acc[label] = (...args) => css`
		@media (max-width: ${sizes[label] / 16}em) {
			${css(...args)}
		}`;
    acc[label + 'Only'] = (...args) => css`
		@media (min-width: ${sizes[label] / 16}em) {
			${css(...args)}
		}`;
    return acc;
  },
  {}
);

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
  media,
};
