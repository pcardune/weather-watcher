import memoize from 'lodash.memoize';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Range from 'rc-slider/lib/Range';
import Handle from 'rc-slider/lib/Handle';
import Tooltip from 'rc-tooltip';
import styled from 'styled-components';
import Color from 'color';

import Theme from 'app/Theme';
import {ScoreConfigShape} from 'app/propTypes';
import Button from './Button';
import {FormField, Label, ButtonBar} from './forms';

function gradient(left, right) {
  return `linear-gradient(to right, ${left} 0%,${right} 100%)`;
}

const SlideWrapper = styled.div`
  margin-bottom: 20px;
  padding: 0 0 0 20px;
  ${props => props.theme.media.phone`padding-top: 10px;`};
`;

const Wrapper = styled.div``;

const {forecastBad, forecastGood, forecastOK} = Theme.colors;

class ScoreRange extends PureComponent {
  static propTypes = {
    ...Range.propTypes,
    marks: PropTypes.arrayOf(PropTypes.string),
    markLabel: PropTypes.string,
  };

  static defaultProps = {
    ...Range.defaultProps,
    marks: [],
    markLabel: '',
  };

  static handleStyle = [
    forecastBad,
    forecastOK,
    forecastGood,
    forecastOK,
    forecastBad,
  ].map(c => ({
    backgroundColor: c,
    borderColor: Color(c).darken(0.3).string(),
  }));

  static trackStyle = [
    {
      background: gradient(forecastBad, forecastOK),
    },
    {
      background: gradient(forecastOK, forecastGood),
    },
    {
      background: gradient(forecastGood, forecastOK),
    },
    {
      background: gradient(forecastOK, forecastBad),
    },
  ];

  static railStyle = {
    backgroundColor: forecastBad,
    borderRadius: 0,
    boxSizing: 'content-box',
    borderRightWidth: 1,
    borderRightColor: forecastBad,
    borderRightStyle: 'solid',
  };

  static dotStyle = {
    backgroundColor: forecastBad,
    borderWidth: 0,
    borderRadius: 0,
    width: 1,
    marginLeft: 0,
    top: 4,
    height: 4,
  };

  state = {
    value: this.props.value,
    visibles: {},
  };

  componentWillReceiveProps({value}) {
    this.setState({value});
  }

  onChange = value => {
    this.setState({value});
  };

  onAfterChange = () => {
    this.props.onChange(this.state.value);
  };

  formatTooltip = value => `${value}${this.props.markLabel}`;

  handleTooltipVisibleChange = (index, visible) => {
    this.setState(prevState => ({
      visibles: {
        ...prevState.visibles,
        [index]: visible,
      },
    }));
  };

  handleWithTooltip = ({value, dragging, index, disabled, ...restProps}) => {
    const {tipProps} = this.props;

    return (
      <Tooltip
        {...tipProps}
        prefixCls="rc-slider-tooltip"
        overlay={this.formatTooltip(value)}
        placement="top"
        visible={!disabled && (this.state.visibles[index] || dragging)}
        key={index}
      >
        <Handle
          {...restProps}
          style={ScoreRange.handleStyle[index]}
          value={value}
          onMouseEnter={() => this.handleTooltipVisibleChange(index, true)}
          onMouseLeave={() => this.handleTooltipVisibleChange(index, false)}
        />
      </Tooltip>
    );
  };

  render() {
    const marks = {};
    const numMarks = 5;
    for (let i = 0; i <= numMarks; i++) {
      const mark =
        (this.props.max - this.props.min) / numMarks * i + this.props.min;
      marks[mark] = {
        label: `${Math.round(Math.floor(mark * 100)) / 100}${this.props
          .markLabel}`,
        style: {backgroundColor: 'white'},
      };
    }
    return (
      <div className="col s12 m9">
        <SlideWrapper>
          <Range
            {...this.props}
            railStyle={ScoreRange.railStyle}
            handleStyle={ScoreRange.handleStyle}
            trackStyle={ScoreRange.trackStyle}
            value={this.state.value}
            onChange={this.onChange}
            onAfterChange={this.onAfterChange}
            marks={marks}
            dotStyle={ScoreRange.dotStyle}
            handle={this.handleWithTooltip}
          />
        </SlideWrapper>
      </div>
    );
  }
}

export default class CustomizeScoreForm extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    scoreConfig: ScoreConfigShape.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  change = changes => {
    this.props.onChange({...this.props.scoreConfig, ...changes});
  };

  onChangeRange = memoize(name => value => {
    this.change({[name]: value});
  });

  render() {
    const {scoreConfig} = this.props;
    return (
      <Wrapper>
        <FormField>
          <Label>Temperature:</Label>
          <ScoreRange
            pushable
            min={0}
            max={100}
            markLabel="ºF"
            value={scoreConfig.tempRange}
            onChange={this.onChangeRange('tempRange')}
          />
        </FormField>
        <FormField>
          <Label>Wind:</Label>
          <ScoreRange
            pushable
            min={0}
            max={50}
            markLabel="mph"
            value={scoreConfig.windRange}
            onChange={this.onChangeRange('windRange')}
          />
        </FormField>
        <FormField>
          <Label>Chance of Rain:</Label>
          <ScoreRange
            pushable
            min={0}
            max={100}
            markLabel="%"
            value={scoreConfig.precipRange}
            onChange={this.onChangeRange('precipRange')}
          />
        </FormField>
        <FormField>
          <Label>Amount of Rain:</Label>
          <ScoreRange
            pushable
            min={0}
            max={0.5}
            step={0.01}
            markLabel={'"'}
            value={scoreConfig.quantityRange}
            onChange={this.onChangeRange('quantityRange')}
          />
        </FormField>
        <ButtonBar>
          <Button type="button" accent onClick={this.props.onClose}>
            Done
          </Button>
        </ButtonBar>
      </Wrapper>
    );
  }
}
