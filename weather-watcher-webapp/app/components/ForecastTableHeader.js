import React from 'react';
import styled from 'styled-components';

const ColumnHeader = styled.th`
  text-align: left;
  padding: 5px 5px 0;
  font-size: 14px;
  font-weight: 400;
`;

const HeaderRow = styled.tr`
  ${ColumnHeader}:first-child {
    padding-left: 35px;
  }
  ${props => props.theme.media.phone`
    display: none;
  `};
`;

const UnitCell = styled.th`
  text-align: left;
  color: #aaa;
  font-weight: normal;
  font-size: 0.7em;
  padding: 0px 5px 5px;
`;

export default function ForecastTableHeader() {
  return (
    <thead>
      <HeaderRow>
        <ColumnHeader colSpan={5} />
        <ColumnHeader colSpan={2} style={{textAlign: 'center'}}>
          Precipitation
        </ColumnHeader>
        <ColumnHeader colSpan={2} />
      </HeaderRow>
      <HeaderRow>
        <ColumnHeader style={{width: 50}}>Score</ColumnHeader>
        <ColumnHeader style={{minWidth: 200}}>Location</ColumnHeader>
        <ColumnHeader style={{width: 50}}>Low</ColumnHeader>
        <ColumnHeader style={{width: 50}}>High</ColumnHeader>
        <ColumnHeader style={{width: 50}}>Wind</ColumnHeader>
        <ColumnHeader style={{width: 50}}>Chance</ColumnHeader>
        <ColumnHeader style={{width: 50}}>Quantity</ColumnHeader>
        <ColumnHeader style={{width: 150}}>Forecast</ColumnHeader>
        <ColumnHeader />
      </HeaderRow>
      <HeaderRow>
        <UnitCell />
        <UnitCell />
        <UnitCell>ºF</UnitCell>
        <UnitCell>ºF</UnitCell>
        <UnitCell>mph</UnitCell>
        <UnitCell>%</UnitCell>
        <UnitCell>in</UnitCell>
        <UnitCell />
        <UnitCell />
      </HeaderRow>
    </thead>
  );
}
