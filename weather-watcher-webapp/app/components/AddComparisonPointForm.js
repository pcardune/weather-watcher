import styled from 'styled-components';
import React, {Component, PropTypes} from 'react';
import {Map, Marker, Popup, TileLayer} from 'react-leaflet';
import 'react-geosuggest/module/geosuggest.css';

import {round} from 'app/utils/math';
import Button from './Button';
import Dialog, {DialogBody, DialogFooter} from './Dialog';
import {FormField, Input, Label, HelpText} from './forms';
import LocationTypeahead from './LocationTypeahead';

const LocationInfo = styled.div`
  display: flex;
  justify-content: space-between;
  > * {
    width: 100%;
  }
`;

export default class AddComparisonPointForm extends Component {
  static propTypes = {
    ...Dialog.propTypes,
    onAdd: PropTypes.func.isRequired,
  };

  state = {
    name: 'Index',
    position: {
      lat: 47.8207,
      lng: -121.5551,
    },
  };

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onClickAdd = () => {
    this.props.onAdd({
      name: this.state.name,
      position: this.state.position,
    });
  };

  onChangeLocation = suggestion => {
    this.setState({
      name: suggestion.gmaps.address_components[0].long_name,
      position: suggestion.location,
    });
  };

  onMarkerDragEnd = event => {
    this.setState({position: event.target.getLatLng()});
  };

  onMapClick = event => {
    this.setState({position: event.latlng});
  };

  render() {
    const {onAdd, ...dialogProps} = this.props;

    return (
      <Dialog {...dialogProps} title="Add Location">
        <DialogBody>
          <LocationInfo>
            <div>
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
                <Label>Coordinates:</Label>
                {round(this.state.position.lat, 4)}
                ,
                {' '}
                {round(this.state.position.lng, 4)}
                <HelpText>
                  click the map or drag the marker to change coordinates
                </HelpText>
              </FormField>
            </div>
            <div>
              <FormField>
                <LocationTypeahead onChange={this.onChangeLocation} />
              </FormField>
              <Map
                center={this.state.position}
                zoom={11}
                style={{height: 300}}
                onClick={this.onMapClick}
              >
                <TileLayer
                  url="http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
                  attribution="© <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                <Marker
                  position={this.state.position}
                  draggable
                  onDragEnd={this.onMarkerDragEnd}
                />
              </Map>
            </div>
          </LocationInfo>
        </DialogBody>
        <DialogFooter>
          <Button flat type="button" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={this.onClickAdd}>Add</Button>
        </DialogFooter>
      </Dialog>
    );
  }
}
