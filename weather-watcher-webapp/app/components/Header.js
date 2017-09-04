import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import {addComparisonPoint} from 'app/containers/Database/actions';
import Theme from 'app/Theme';
import {round} from 'app/utils/math';

import SmartLink from './SmartLink';
import LocationTypeahead, {LocationTypeaheadWrapper} from './LocationTypeahead';

const NavBar = styled.div`
  text-align: center;
  position: relative;
  ${SmartLink} {
    color: ${props => props.theme.colors.textOnPrimary};
    display: inline-block;
    text-decoration: none;

    h1 {
      font-family: 'Clicker Script', cursive;
      font-weight: bold;
      margin-bottom: 0;
      font-size: 5em;
    }
    h5 {
      margin-bottom: 1em;
      font-weight: 300;
    }
  }
`;

const QuickLinks = styled.div`
  background: ${props => props.theme.colors.primaryDark};
  text-align: center;
  ${LocationTypeaheadWrapper}, ${SmartLink} {
    display: inline-block;
    padding: 10px;
  }
  ${SmartLink} {
    color: ${props => props.theme.colors.textOnPrimary};
    text-decoration: none;
    cursor: pointer;
    font-size: 24px;
    font-weight: 300;
    &.selected {
      text-decoration: underline;
    }
  }
  ${LocationTypeaheadWrapper} {
    input {
      height: inherit;
      margin: 0px;
      padding: 10px;
      border-radius: 5px;
      color: white;
    }
  }
`;

@withRouter
@connect(null, {onAddComparisonPoint: addComparisonPoint})
export default class Header extends Component {
  static propTypes = {
    //    onNewComparison: PropTypes.func.isRequired,
    comparisons: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
  };

  onChangeLocation = async (suggestion, typeahead) => {
    const name = suggestion.gmaps.address_components[0].long_name;
    const position = suggestion.location;
    const placeId = suggestion.gmaps.place_id;
    const id = `${name}|${round(position.lat, 4)}|${round(position.lng, 4)}`
      .replace(/\./g, ',')
      .replace(/\s/g, '')
      .toLowerCase();
    this.props.onAddComparisonPoint({
      id,
      name,
      position,
      placeId,
    });
    this.props.history.push(`/locations/${id}`);
    typeahead.clear();
  };

  render() {
    return (
      <div>
        <NavBar className={Theme.colorClass.primary}>
          <SmartLink to="/">
            <h1 className="amber-text text-lighten-2">Goldilocks Weather</h1>
            <h5 className="amber-text text-lighten-5">
              weather that{"'"}s{' '}
              <em>
                <u>just</u>
              </em>{' '}
              right
            </h5>
          </SmartLink>
        </NavBar>
        <QuickLinks className={Theme.colorClass.primaryDark}>
          {this.props.comparisons.valueSeq().map(comparison =>
            <SmartLink
              key={comparison.id}
              activeClassName="selected"
              to={`/compare/${comparison.id}`}
            >
              {comparison.name}
            </SmartLink>
          )}
          <LocationTypeahead onChange={this.onChangeLocation} />
          {/* <QuickButton onClick={this.props.onNewComparison}>
                  + New Comparison
              </QuickButton>*/}
        </QuickLinks>
      </div>
    );
  }
}
