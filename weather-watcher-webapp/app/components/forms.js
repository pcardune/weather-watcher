import React from 'react';
import styled, {css} from 'styled-components';

export const inputStyle = css`
  border: 1px solid ${props => props.theme.colors.divider};
  padding: 5px;
  outline: none;
  box-shadow: none;
`;

export const Input = styled.input`${inputStyle};`;

export function Label(props) {
  return (
    <div className={`col s12 m2 ${props.className}`}>
      {props.children}
    </div>
  );
}

export function FormField(props) {
  return (
    <div className={`row ${props.className}`}>
      {props.children}
    </div>
  );
}

export const HelpText = styled.div`
  color: ${props => props.theme.colors.secondaryText};
  font-size: small;
`;

export const ButtonBar = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  > * {
    margin-left: ${props => props.theme.padding.standard};
  }
`;
