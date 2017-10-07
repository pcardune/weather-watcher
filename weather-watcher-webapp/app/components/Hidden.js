import React from 'react';
import {Hidden as MUIHidden} from 'material-ui';
//import HiddenJs from 'material-ui/Hidden/HiddenJs';
import {Route} from 'react-router-dom';

export default function Hidden(props) {
  return (
    <Route
      render={({staticContext}) => {
        let initialWidth;
        if (process.env.IS_SERVER) {
          initialWidth = 375;
          if (staticContext && staticContext.innerWidth) {
            initialWidth = staticContext.innerWidth;
          }
        }
        //        console.log('initial width is', initialWidth);
        return <HiddenJs width={initialWidth} {...props} />;
      }}
    />
  );
}

import warning from 'warning';
import {keys as breakpointKeys} from 'material-ui/styles/createBreakpoints';
import withWidth, {isWidthDown, isWidthUp} from 'material-ui/utils/withWidth';

/**
 * @ignore - internal component.
 */
const HiddenJs = withWidth()(function HiddenJs(props: Props) {
  const {
    children,
    only,
    xsUp,
    smUp,
    mdUp,
    lgUp,
    xlUp,
    xsDown,
    smDown,
    mdDown,
    lgDown,
    xlDown,
    width,
    ...other
  } = props;

  warning(
    Object.keys(other).length === 0,
    `Material-UI: unsupported properties received ${JSON.stringify(
      other
    )} by \`<Hidden />\`.`
  );

  let visible = true;

  // `only` check is faster to get out sooner if used.
  if (only) {
    if (Array.isArray(only)) {
      for (let i = 0; i < only.length; i += 1) {
        const breakpoint = only[i];
        if (width === breakpoint) {
          visible = false;
          break;
        }
      }
    } else if (only && width === only) {
      visible = false;
    }
  }

  // Allow `only` to be combined with other props. If already hidden, no need to check others.
  if (visible) {
    // determine visibility based on the smallest size up
    for (let i = 0; i < breakpointKeys.length; i += 1) {
      const breakpoint = breakpointKeys[i];
      const breakpointUp = props[`${breakpoint}Up`];
      const breakpointDown = props[`${breakpoint}Down`];
      if (
        (breakpointUp && isWidthUp(breakpoint, width)) ||
        (breakpointDown && isWidthDown(breakpoint, width))
      ) {
        visible = false;
        break;
      }
    }
  }

  if (!visible) {
    return null;
  }

  return children;
});
