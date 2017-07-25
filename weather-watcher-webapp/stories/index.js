/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import React from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';

import {Toolbar} from 'app/components/Toolbar';

storiesOf('Overview', module).add('Basic Page Layout', () =>
  <div>
    <Toolbar>A Toolbar</Toolbar>
  </div>
);
