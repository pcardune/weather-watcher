import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';
import styled from 'styled-components';
import {Grid, Button} from 'material-ui';
import Icon from 'material-ui/Icon';

import Hidden from 'app/components/Hidden';
import {getForecastDates} from 'app/utils/dates';

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
      <Grid container justify="space-around" align="center">
        <Grid item>
          <Button
            onClick={this.onClickPrevDate}
            disabled={!this.canClickPrevDate()}
            raised
            disableRipple
          >
            <Hidden mdDown>
              <Icon>chevron_left</Icon>
            </Hidden>
            {moment(this.props.currentDate).subtract(1, 'days').format('ddd')}
          </Button>
        </Grid>
        <Grid item>
          <Hidden mdDown>
            <h3>
              {moment(this.props.currentDate).format('dddd')}
            </h3>
          </Hidden>
          <Hidden lgUp>
            <h5>
              {moment(this.props.currentDate).format('ddd')}
            </h5>
          </Hidden>
        </Grid>
        <Grid item>
          <Button
            onClick={this.onClickNextDate}
            disabled={!this.canClickNextDate()}
            raised
            disableRipple
          >
            {moment(this.props.currentDate).add(1, 'days').format('ddd')}
            <Hidden mdDown>
              <Icon>chevron_right</Icon>
            </Hidden>
          </Button>
        </Grid>
      </Grid>
    );
  }
}
