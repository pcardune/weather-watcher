import styled from 'styled-components';

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textOnPrimary};
  padding: 0 25px;
  min-height: 70px;
  h1 {
    font-size: 24px;
    font-weight: 100;
    width: 100%;
  }
`;

export const CardBody = styled.div`
`;

export const Card = styled.div`
  max-width: 800px;
  box-shadow: ${props => props.theme.shadows.level1};
  margin: auto;
`;
