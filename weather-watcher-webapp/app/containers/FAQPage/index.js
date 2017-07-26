import React, {Component} from 'react';
import styled from 'styled-components';

import {Card, CardHeader, CardBody} from 'app/components/Card';
import {OUR_URL, OUR_EMAIL} from 'app/constants';

const List = styled.ul`
  list-style: none;
  padding: 0 ${props => props.theme.padding.standard};
`;

const ListQuestion = styled.li`font-weight: bold;`;

const ListAnswer = styled.li`padding-bottom: 15px;`;

export default class FAQPage extends Component {
  render() {
    return (
      <Card>
        <CardHeader>
          <h1>FAQ</h1>
        </CardHeader>
        <CardBody>
          <List>
            <ListQuestion>How are the scores determined?</ListQuestion>
            <ListAnswer>Magic!</ListAnswer>
            <ListQuestion>
              {`How come a location I'm interested in isn't listed?`}
            </ListQuestion>
            <ListAnswer>
              {`We're still in beta and all of our locations are manually entered
              by ${OUR_URL} creators. Please email us at ${OUR_EMAIL} with
              a location that interests you and we'll gladly add it to the
              list!`}
            </ListAnswer>
            <ListQuestion>I found a bug!</ListQuestion>
            <ListAnswer>
              {`Thanks for your interest in improving the site. Please email us at
              ${OUR_EMAIL} and we'll do our best to address it.`}
            </ListAnswer>
          </List>
        </CardBody>
      </Card>
    );
  }
}
