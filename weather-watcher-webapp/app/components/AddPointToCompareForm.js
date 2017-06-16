import styled from 'styled-components';
import React, {Component, PropTypes} from 'react';
import PointToCompare from 'models/PointToCompare';
import {Button, FormField, Input, Label} from './forms';

const Form = styled.form`
  border: 1px solid #eee;
  padding: 10px;
`;

export default class AddPointToCompareForm extends Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired,
  };
  state = {
    name: '',
    latitude: '',
    longitude: '',
  };

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onClickAdd = () => {
    this.props.onAdd(
      new PointToCompare({
        name: this.state.name,
        longitude: parseFloat(this.state.longitude),
        latitude: parseFloat(this.state.latitude),
      })
    );
  };

  render() {
    return (
      <Form>
        <FormField>
          <Label>Name:</Label>
          <Input
            type="text"
            name="name"
            value={this.state.name}
            onChange={this.onChange}
          />
        </FormField>
        <FormField>
          <Label>Latitude:</Label>
          <Input
            type="text"
            name="latitude"
            value={this.state.latitude}
            onChange={this.onChange}
          />
        </FormField>
        <FormField>
          <Label>Longitude:</Label>
          <Input
            type="text"
            name="longitude"
            value={this.state.longitude}
            onChange={this.onChange}
          />
        </FormField>
        <Button type="button" onClick={this.onClickAdd}>Add</Button>
      </Form>
    );
  }
}
