import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Geosuggest from 'react-geosuggest';
import styled, {withTheme} from 'styled-components';
import {inputStyle} from './forms';

export const LocationTypeaheadWrapper = styled.div`
  .geosuggest {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .geosuggest__input {
    ${inputStyle} border: 1px solid ${props =>
        props.theme.colors.divider} !important;
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
    className: PropTypes.string,
  };

  focus = () => {
    this.geosuggest.focus();
  };

  clear = () => {
    this.geosuggest.clear();
  };

  blur = () => {
    this.geosuggest.blur();
  };

  onChange = suggestion => {
    this.props.onChange(suggestion, this);
  };

  render() {
    return (
      <LocationTypeaheadWrapper className={this.props.className}>
        <Geosuggest
          country="us"
          onSuggestSelect={this.onChange}
          placeholder="Search for a location..."
          ref={el => {
            this.geosuggest = el;
          }}
        />
      </LocationTypeaheadWrapper>
    );
  }
}
