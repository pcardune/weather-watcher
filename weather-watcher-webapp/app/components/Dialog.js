import styled from 'styled-components';

export const Dialog = styled.div`
  position: fixed;
  top: 25%;
  left: 25%;
  width: 50%;
  margin: auto;
  min-width: 640px;
  min-height: 100px;
  box-shadow: ${props => props.theme.shadows.level1};
  background: white;

  h1 {
    font-weight: 100;
    font-size: 20px;
    padding: 15px;
    margin: 0;
  }
`;
