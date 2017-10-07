import React, {PureComponent} from 'react';
import styled from 'styled-components';

import Hidden from 'app/components/Hidden';

const ColumnHeader = styled.th`
  text-align: left;
  padding: 5px 5px 0;
  font-size: 14px;
  font-weight: 400;
  width: ${props => props.width || 50}px;
`;

const PrecipitationColumnHeader = ColumnHeader.extend(`
  text-align: center;
`);

const UnitCell = styled.th`
  text-align: left;
  color: #aaa;
  font-weight: normal;
  font-size: 0.7em;
  padding: 0px 5px 5px;
`;

export default class ForecastTableHeader extends PureComponent {
  render() {
    return (
      <Hidden mdDown>
        <thead>
          <tr>
            <ColumnHeader colSpan={5} />
            <PrecipitationColumnHeader colSpan={2}>
              Precipitation
            </PrecipitationColumnHeader>
            <ColumnHeader />
          </tr>
          <tr>
            <ColumnHeader>Grade</ColumnHeader>
            <ColumnHeader style={{minWidth: 200}}>Location</ColumnHeader>
            <ColumnHeader>Low</ColumnHeader>
            <ColumnHeader>High</ColumnHeader>
            <ColumnHeader>Wind</ColumnHeader>
            <ColumnHeader>Chance</ColumnHeader>
            <ColumnHeader>Quantity</ColumnHeader>
            <ColumnHeader width={150}>Forecast</ColumnHeader>
          </tr>
          <tr>
            <UnitCell />
            <UnitCell />
            <UnitCell>ºF</UnitCell>
            <UnitCell>ºF</UnitCell>
            <UnitCell>mph</UnitCell>
            <UnitCell>%</UnitCell>
            <UnitCell>in</UnitCell>
            <UnitCell />
          </tr>
        </thead>
      </Hidden>
    );
  }
}
