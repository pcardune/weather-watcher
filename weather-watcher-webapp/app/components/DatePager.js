import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';
import styled from 'styled-components';

import {getForecastDates} from 'app/utils/dates';
import Button from './Button';

const Wrapper = styled.div`margin-bottom: 0px;`;

export default class DatePager extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    currentDate: PropTypes.instanceOf(Date).isRequired,
  };

  get minDate() {
    return getForecastDates()[0];
  }

  get maxDate() {
    return getForecastDates().slice(-1)[0];
  }

  getPrevDate = () =>
    moment(this.props.currentDate).subtract(1, 'days').toDate();

  getNextDate = () => moment(this.props.currentDate).add(1, 'days').toDate();

  canClickPrevDate = () =>
    moment(this.getPrevDate()).isSameOrAfter(this.minDate);

  canClickNextDate = () =>
    moment(this.getNextDate()).isSameOrBefore(this.maxDate);

  onClickPrevDate = () => {
    if (this.canClickPrevDate()) {
      this.props.onChange(this.getPrevDate());
    }
  };

  onClickNextDate = () => {
    if (this.canClickNextDate()) {
      this.props.onChange(this.getNextDate());
    }
  };

  render() {
    return (
      <Wrapper className="row valign-wrapper">
        <div className="col m4 s5 center-align">
          <Button
            onClick={this.onClickPrevDate}
            disabled={!this.canClickPrevDate()}
            iconLeft="chevron_left"
            hideLabelOnMobile
          >
            {moment(this.props.currentDate).subtract(1, 'days').format('ddd')}
          </Button>
        </div>
        <div className="col m4 s2 center-align">
          <h3 className="hide-on-med-and-down">
            {moment(this.props.currentDate).format('dddd')}
          </h3>
          <h5 className="hide-on-large-only">
            {moment(this.props.currentDate).format('ddd')}
          </h5>
        </div>
        <div className="col m4 s5 center-align">
          <Button
            onClick={this.onClickNextDate}
            disabled={!this.canClickNextDate()}
            iconRight="chevron_right"
            hideLabelOnMobile
          >
            {moment(this.props.currentDate).add(1, 'days').format('ddd')}
          </Button>
        </div>
      </Wrapper>
    );
  }
}
