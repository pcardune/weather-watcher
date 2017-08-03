import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';
import styled from 'styled-components';

import {Desktop, Phone} from './Responsive';
import Button from './Button';

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
          <Desktop>
            {isDesktop => {
              const props = {
                onClick: this.onClickPrevDate,
                disabled: !this.canClickPrevDate(),
              };
              return isDesktop
                ? <Button {...props} iconLeft="chevron_left">
                    {moment(this.props.currentDate)
                      .subtract(1, 'days')
                      .format('ddd')}
                  </Button>
                : <Button {...props} icon="chevron_left" />;
            }}
          </Desktop>
        </div>
        <div className="col m4 s2 center-align">
          <Desktop>
            <h3>
              {moment(this.props.currentDate).format('dddd')}
            </h3>
          </Desktop>
          <Phone>
            <h5>
              {moment(this.props.currentDate).format('ddd')}
            </h5>
          </Phone>
        </div>
        <div className="col m4 s5 center-align">
          <Desktop>
            {isDesktop => {
              const props = {
                onClick: this.onClickNextDate,
                disabled: !this.canClickNextDate(),
              };
              return isDesktop
                ? <Button {...props} iconRight="chevron_right">
                    {moment(this.props.currentDate)
                      .add(1, 'days')
                      .format('ddd')}
                  </Button>
                : <Button {...props} icon="chevron_right" />;
            }}
          </Desktop>
        </div>
      </Wrapper>
    );
  }
}
