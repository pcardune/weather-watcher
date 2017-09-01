import React from 'react';
import {Route} from 'react-router-dom';

export default function AssignToRouterContext({contextKey, value}) {
  return (
    <Route
      render={({staticContext, ...rest}) => {
        if (staticContext) {
          if (typeof value === 'function') {
            staticContext[contextKey] = value({
              staticContext,
              contextKey,
              ...rest,
            });
          } else {
            staticContext[contextKey] = value;
          }
        }
        return null;
      }}
    />
  );
}
