import styled from 'styled-components';
import React, {Component, PropTypes} from 'react';
import Geosuggest from 'react-geosuggest';
import 'react-geosuggest/module/geosuggest.css';

import {Button, FormField, Input, Label} from './forms';

const Form = styled.form`
  border: 1px solid #eee;
  padding: 10px;
`;

export default class AddComparisonPointForm extends Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired,
  };

  state = {
    name: 'Index',
    latitude: '47.8207',
    longitude: '-121.5551',
  };

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onClickAdd = () => {
    this.props.onAdd({
      name: this.state.name,
      longitude: parseFloat(this.state.longitude),
      latitude: parseFloat(this.state.latitude),
    });
  };

  onSuggestSelect = suggestion => {
    this.setState({
      name: suggestion.gmaps.address_components[0].long_name,
      longitude: suggestion.location.lng,
      latitude: suggestion.location.lat,
    });
  };

  render() {
    return (
      <Form>
        <Geosuggest country="us" onSuggestSelect={this.onSuggestSelect} />
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
