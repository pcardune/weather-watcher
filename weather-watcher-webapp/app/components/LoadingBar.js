import React from 'react';
import styled, {keyframes} from 'styled-components';

const bounce = keyframes`
  from {
    width: 10%;
  }
  50% {
    width: 100%;
  }
  to {
    width: 10%;
  }
`;

const InnerBar = styled.div`
  background: ${props => props.theme.colors.accent};
  height: 100%;
  width: 10%;
  animation: ${bounce} 2s linear infinite;
  border-radius: 2px;
  height: 4px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 0px;
  width: 100%;
  background-clip: padding-box;
`;

export default () =>
  <Wrapper>
    <InnerBar />
  </Wrapper>;
