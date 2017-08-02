import React from 'react';
import MediaQuery from 'react-responsive';

export const Desktop = ({children}) =>
  <MediaQuery minWidth={600} children={children} />;
export const Phone = ({children}) =>
  <MediaQuery maxWidth={600} children={children} />;
