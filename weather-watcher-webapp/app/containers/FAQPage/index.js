import React, {Component} from 'react';
import styled from 'styled-components';
import {Typography} from 'material-ui';

import {OUR_URL, OUR_EMAIL} from 'app/constants';
import trackEvent from 'app/trackEvent';
import PageBody from 'app/components/PageBody';

const FAQWrapper = styled.div`
  padding-top: ${props => props.theme.padding.standard};

  ul {
    list-style: none;
    padding: 0 ${props => props.theme.padding.standard};
  }
`;

const ListQuestion = styled.li`font-weight: bold;`;

const ListAnswer = styled.li`padding-bottom: 15px;`;

export default class FAQPage extends Component {
  componentDidMount() {
    trackEvent('ViewContent', {
      content_type: 'info',
      content_ids: ['faq'],
    });
  }

  render() {
    return (
      <PageBody>
        <Typography type="title">FAQ</Typography>
        <ul>
          <ListQuestion>How are the grades determined?</ListQuestion>
          <ListAnswer>
            <p>
              Grades are determined by looking at the temperature, wind, chance
              of precipitation, and amount of precipitation over the course of
              the day. Each of these weather factors is assigned a color (red,
              yellow, or green) based on what range they fall into. For example,
              a temperature of 65ºF would be considered green, while a
              temperature of 100ºF would be considered red. If one or more of
              these weather factors are red for most of the day, then the
              overall grade for that day will appear in red.
            </p>
            <p>
              You can adjust the red, yellow, and green ranges for these weather
              factors to match your intended activity by clicking on the gear
              icon above the forecast.
            </p>
          </ListAnswer>
          <ListQuestion>
            {"How come a location I'm interested in isn't listed?"}
          </ListQuestion>
          <ListAnswer>
            We{"'"}re still in beta and all of our locations are manually
            entered by {OUR_URL} creators. Please email us at{' '}
            <a href={`mailto:${OUR_EMAIL}`}>{OUR_EMAIL}</a> with a location that
            interests you and we{"'"}ll gladly add it to the list!
          </ListAnswer>
          <ListQuestion>How do I submit a bug?</ListQuestion>
          <ListAnswer>
            {`Thanks for your interest in improving the site. Please email us at
                ${OUR_EMAIL} and we'll do our best to address it.`}
          </ListAnswer>
        </ul>
      </PageBody>
    );
  }
}
