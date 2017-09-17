import React from 'react';
import PropTypes from 'prop-types';
import matchMedia from 'matchmediaquery';

const QUERIES = {
  desktop: '(min-width: 600px)',
  phone: '(max-width: 600px)',
};

function MediaQuery(props) {
  let matches;
  if (process.env.IS_SERVER) {
    matches = props.query === 'desktop';
  } else {
    matches = matchMedia(QUERIES[props.query]).matches;
  }

  if (!matches) {
    return null;
  }

  if (typeof props.children === 'function') {
    return props.children(matches);
  }
  const childrenCount = React.Children.count(props.children);
  const wrapChildren =
    props.component ||
    childrenCount > 1 ||
    typeof props.children === 'string' ||
    (Array.isArray(props.children) && childrenCount === 1) ||
    props.children === undefined;
  if (wrapChildren) {
    return React.createElement(props.component || 'div', props, props.children);
  } else if (childrenCount) {
    return props.children;
  }
  return null;
}
MediaQuery.propTypes = {
  component: PropTypes.node,
  query: PropTypes.oneOf(Object.keys(QUERIES)).isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};
MediaQuery.defaultProps = {
  component: null,
};

export const Desktop = props => <MediaQuery {...props} query="desktop" />;
export const Phone = props => <MediaQuery {...props} query="phone" />;
