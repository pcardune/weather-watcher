import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import styled from 'styled-components';
import convert from 'convert-units';

import {ScoreConfigShape} from 'app/propTypes';
import Button from './Button';
import Number from './Number';
import {FormField, Label, ButtonBar} from './forms';

const SlideWrapper = styled.div`
  display: inline-block;
  width: 20em;
`;

const Wrapper = styled.div`
  ${SlideWrapper} {
    margin-right: 25px;
  }
`;

export default class CustomizeScoreForm extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    scoreConfig: ScoreConfigShape.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  onChange = event => {
    const changes = {[event.target.name]: event.target.value};
    this.props.onChange({...this.props.scoreConfig, ...changes});
  };

  onChangeTemp = idealTemp => {
    this.props.onChange({
      ...this.props.scoreConfig,
      idealTemp: convert(idealTemp).from('F').to('C'),
    });
  };

  render() {
    return (
      <Wrapper>
        <FormField>
          <Label>Ideal Temp:</Label>
          <SlideWrapper>
            <Slider
              min={0}
              max={100}
              value={convert(this.props.scoreConfig.idealTemp)
                .from('C')
                .to('F')}
              onChange={this.onChangeTemp}
            />
          </SlideWrapper>
          <Number value={this.props.scoreConfig.idealTemp} from="C" to="F" /> ºF
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
