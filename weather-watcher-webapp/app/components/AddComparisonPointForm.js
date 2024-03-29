import styled from 'styled-components';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'material-ui';

import {round} from 'app/utils/math';
import {FormField, Input, Label, HelpText, ButtonBar} from './forms';
import LocationTypeahead from './LocationTypeahead';

const LocationInfo = styled.div`
  display: flex;
  justify-content: space-between;
  > * {
    width: 100%;
  }
  margin-bottom: ${props => props.theme.padding.standard};
`;

let Map, Marker, TileLayer;

export default class AddComparisonPointForm extends Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  state = {
    name: 'Index',
    position: {
      lat: 47.8207,
      lng: -121.5551,
    },
    leafletLoaded: false,
  };

  componentDidMount() {
    this.locationInput.focus();
    import(/* webpackChunkName: "react-leaflet" */ 'react-leaflet').then(
      ReactLeaflet => {
        Map = ReactLeaflet.Map;
        Marker = ReactLeaflet.Marker;
        TileLayer = ReactLeaflet.TileLayer;
        this.setState({leafletLoaded: true});
      }
    );
  }

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
    return (
      <div>
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
              , {round(this.state.position.lng, 4)}
              <HelpText>
                click the map or drag the marker to change coordinates
              </HelpText>
            </FormField>
          </div>
          <div>
            <FormField>
              <LocationTypeahead
                ref={el => {
                  this.locationInput = el;
                }}
                onChange={this.onChangeLocation}
              />
            </FormField>
            {this.state.leafletLoaded &&
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
              </Map>}
          </div>
        </LocationInfo>
        <ButtonBar>
          <Button color="accent" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button color="accent" onClick={this.onClickAdd}>
            Add
          </Button>
        </ButtonBar>
      </div>
    );
  }
}
