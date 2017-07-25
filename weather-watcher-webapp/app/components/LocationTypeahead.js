import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Geosuggest from 'react-geosuggest';
import styled, {withTheme} from 'styled-components';
import {inputStyle} from './forms';

const StyledGeosuggest = styled(Geosuggest)`
  &.geosuggest {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .geosuggest__input {
    ${inputStyle}
    border: 1px solid ${props => props.theme.colors.divider} !important;
  }
  .geosuggest__suggests {
    border: 1px solid ${props => props.theme.colors.divider};
    z-index: 1200;
  }
  .geosuggest__suggests--hidden {
    border: 0px;
  }
`;

export default class LocationTypeahead extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  };

  focus = () => {
    this.geosuggest.focus();
  };

  render() {
    return (
      <StyledGeosuggest
        country="us"
        onSuggestSelect={this.props.onChange}
        placeholder="Search for a location..."
        innerRef={el => (this.geosuggest = el)}
      />
    );
  }
}
