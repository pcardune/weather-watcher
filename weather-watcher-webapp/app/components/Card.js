import React from 'react';
import styled from 'styled-components';

export function CardBody(props) {
  return (
    <div className={`card-content ${props.className}`}>
      {props.children}
    </div>
  );
}

const CardHeaderWrapper = styled.div`position: relative;`;
export function CardHeader(props) {
  return (
    <CardHeaderWrapper
      className={`card-content blue white-text ${props.className}`}
    >
      <div className="card-title">
        {props.title}
      </div>
      {props.children}
    </CardHeaderWrapper>
  );
}

export function Card(props) {
  return (
    <div {...props} className={`card ${props.className}`}>
      {props.children}
    </div>
  );
}
