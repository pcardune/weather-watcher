import React from 'react';
import MediaQuery from 'react-responsive';

let VALUE;
if (process.env.IS_SERVER) {
  VALUE = {
    width: 1000,
  };
}

export const Desktop = ({children}) =>
  <MediaQuery minWidth={600} children={children} value={VALUE} />;
export const Phone = ({children}) =>
  <MediaQuery maxWidth={600} children={children} value={VALUE} />;
