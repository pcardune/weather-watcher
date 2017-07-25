import styled, {css} from 'styled-components';

export const inputStyle = css`
  border: 1px solid ${props => props.theme.colors.divider};
  padding: 5px;
  outline: none;
  box-shadow: none;
`;

export const Input = styled.input`${inputStyle};`;

export const Label = styled.label`
  width: 100px;
  display: inline-block;
`;

export const FormField = styled.div`margin-bottom: 10px;`;

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
