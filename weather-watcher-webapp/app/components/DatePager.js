import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';
import styled from 'styled-components';

import Button from './Button';

const DateHeader = styled.h1`
  font-size: 36px;
  font-weight: 300;
  width: 30%;
  text-align: center;
`;

const Wrapper = styled.div`margin-bottom: 0px;`;

export default class DatePager extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    currentDate: PropTypes.instanceOf(Date).isRequired,
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
  };

  static defaultProps = {
    minDate: moment(new Date()).startOf('day').toDate(),
    maxDate: moment(new Date()).add(6, 'days').startOf('day').toDate(),
  };

  getPrevDate = () =>
    moment(this.props.currentDate).subtract(1, 'days').toDate();

  getNextDate = () => moment(this.props.currentDate).add(1, 'days').toDate();

  canClickPrevDate = () =>
    moment(this.getPrevDate()).isSameOrAfter(this.props.minDate);

  canClickNextDate = () =>
    moment(this.getNextDate()).isSameOrBefore(this.props.maxDate);

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
            accent
          >
            {moment(this.props.currentDate).subtract(1, 'days').format('ddd')}
          </Button>
        </div>
        <div className="col m4 s2 center-align">
          <h1 className="hide-on-small-only">
            {moment(this.props.currentDate).format('dddd')}
          </h1>
          <h1 className="hide-on-med-and-up">
            {moment(this.props.currentDate).format('ddd')}
          </h1>
        </div>
        <div className="col m4 s5 center-align">
          <Button
            onClick={this.onClickNextDate}
            disabled={!this.canClickNextDate()}
            iconRight="chevron_right"
            accent
          >
            {moment(this.props.currentDate).add(1, 'days').format('ddd')}
          </Button>
        </div>
      </Wrapper>
    );
  }
}
