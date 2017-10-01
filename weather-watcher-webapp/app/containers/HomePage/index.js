/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {subscribeProps} from 'redux-firebase-mirror';
import {withRouter} from 'react-router';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Menu,
  MenuItem,
} from 'material-ui';

import firebase from 'app/firebaseApp';
import LoadingBar from 'app/components/LoadingBar';
import PageBody from 'app/components/PageBody';
import MultiDayForecastComparison from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import CustomizeScoreForm from 'app/components/CustomizeScoreForm';
import EditComparisonDialog from 'app/components/EditComparisonDialog';
import AlertDialog from 'app/components/AlertDialog';
import {augmentedComparisonById} from 'app/containers/Database/subscriptions';
import ComparisonChart from 'app/components/ComparisonChart';
import AssignToRouterContext from 'app/components/AssignToRouterContext';
import {
  getScoreConfigFromLocation,
  getDateFromLocation,
  getPathWithScoreConfigAndDate,
} from 'app/utils/url';
import {clampDateToForecastDates} from 'app/utils/dates';
import {
  addComparisonPoint,
  removeComparisonPoint,
} from 'app/containers/Database/actions';
import trackEvent from 'app/trackEvent';
import CardBar from 'app/components/CardBar';

const HelpText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.secondaryText};
  font-weight: 300;
  padding: 50px;
`;

const InnerPane = styled.div`
  padding: ${props => props.theme.padding.standard};
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

@withRouter
@connect(
  (state, {location}) => ({
    scoreConfig: getScoreConfigFromLocation(location),
    date: clampDateToForecastDates(getDateFromLocation(location)),
  }),
  {
    onAddComparisonPoint: addComparisonPoint,
    onRemoveComparisonPoint: removeComparisonPoint,
  }
)
@subscribeProps({
  comparison: augmentedComparisonById,
})
export default class HomePage extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    comparison: AugmentedComparisonShape,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
  };

  static defaultProps = {
    comparison: null,
  };

  state = {
    showCustomizeForm: false,
    showConfirmDelete: false,
  };

  componentDidMount() {
    trackEvent('ViewContent', {
      content_type: 'comparison',
      content_ids: [this.props.comparison.id],
    });
  }

  onRemoveComparisonPoint = comparisonPointId => {
    this.props.onRemoveComparisonPoint(
      this.props.comparison,
      comparisonPointId
    );
  };

  onAddComparisonPoint = args => {
    this.props.onAddComparisonPoint({
      ...args,
      comparisonId: this.props.comparison.id,
    });
    this.hideAddForm();
  };

  onChangeDate = date => {
    this.props.history.push(
      getPathWithScoreConfigAndDate(this.props.location, {date})
    );
  };

  onChangeScoreConfig = scoreConfig => {
    this.props.history.push(
      getPathWithScoreConfigAndDate(this.props.location, {scoreConfig})
    );
  };

  onClickCustomize = () => this.setState({showCustomizeForm: true});
  onClickDoneCustomize = () => this.setState({showCustomizeForm: false});

  onClickSettings = () => this.setState({showEditDialog: true});
  onRequestCloseEditDialog = () => this.setState({showEditDialog: false});

  onClickDelete = () => this.setState({showConfirmDelete: true});
  onRequestCloseConfirmDelete = () => this.setState({showConfirmDelete: false});

  onClickSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().currentUser.linkWithRedirect(provider);
  };

  onConfirmDelete = () => {
    this.props.history.push('/');
    firebase
      .database()
      .ref(`comparisons/${this.props.comparison.id}`)
      .set(null);
  };

  render() {
    const {comparison} = this.props;
    const hasPoints =
      !comparison.isLoading &&
      comparison.comparisonPoints &&
      comparison.comparisonPoints.length > 0;
    const user = firebase.auth().currentUser;
    const isCreator = user && user.uid === comparison.creator;
    return (
      <PageBody>
        <Grid container spacing={24} direction="column">
          <Grid item>
            <Card>
              <CardBar
                title={comparison.name}
                menu={
                  <Menu>
                    <MenuItem onClick={this.onClickCustomize}>
                      Customize Scoring
                    </MenuItem>
                    {isCreator &&
                      <MenuItem onClick={this.onClickSettings} divider>
                        Change Settings
                      </MenuItem>}
                    {isCreator &&
                      <MenuItem onClick={this.onClickDelete}>
                        Delete Comparison
                      </MenuItem>}
                  </Menu>
                }
              >
                <EditComparisonDialog
                  comparison={comparison}
                  open={this.state.showEditDialog}
                  onRequestClose={this.onRequestCloseEditDialog}
                  type="edit"
                />
                <AlertDialog
                  open={this.state.showConfirmDelete}
                  onRequestClose={this.onRequestCloseConfirmDelete}
                  title="Delete this comparison?"
                  description="This can not be undone."
                >
                  <Button>Cancel</Button>
                  <Button raised color="accent" onClick={this.onConfirmDelete}>
                    Delete
                  </Button>
                </AlertDialog>
              </CardBar>
              {comparison.isLoading && <LoadingBar />}
              <AssignToRouterContext
                contextKey="title"
                value={comparison.name}
              />
              <AssignToRouterContext
                contextKey="description"
                value={`Find out what the weather is at ${comparison.name}`}
              />

              {this.state.showCustomizeForm &&
                <CardContent>
                  {this.state.showCustomizeForm &&
                    <InnerPane>
                      <CustomizeScoreForm
                        onClose={this.onClickDoneCustomize}
                        scoreConfig={comparison.scoreConfig}
                        onChange={this.onChangeScoreConfig}
                      />
                    </InnerPane>}
                </CardContent>}
            </Card>
          </Grid>
          {isCreator &&
            user.isAnonymous &&
            <Grid item>
              <Card>
                <CardContent>
                  Sign in with Google to save your comparison!
                </CardContent>
                <CardActions>
                  <Button
                    raised
                    color="accent"
                    disableRipple
                    onClick={this.onClickSignIn}
                  >
                    Sign In With Google
                  </Button>
                </CardActions>
              </Card>
            </Grid>}
          <Grid item>
            <Card>
              <CardHeader title="Daily Forecasts" />
              {hasPoints
                ? <CardContent>
                    <MultiDayForecastComparison
                      onChangeDate={this.onChangeDate}
                      date={this.props.date}
                      comparison={comparison}
                      onRemoveComparisonPoint={this.onRemoveComparisonPoint}
                    />
                  </CardContent>
                : <CardContent>
                    <HelpText>
                      {comparison.isLoading
                        ? 'Loading...'
                        : 'Add a location to start comparing forecasts.'}
                    </HelpText>
                  </CardContent>}
            </Card>
          </Grid>
          {hasPoints &&
            <Grid item>
              <Card>
                <CardHeader title="Weekly Score Comparison" />
                <CardContent>
                  <ComparisonChart
                    comparison={comparison}
                    date={this.props.date}
                    onClickDate={this.onChangeDate}
                  />
                </CardContent>
              </Card>
            </Grid>}
        </Grid>
      </PageBody>
    );
  }
}
