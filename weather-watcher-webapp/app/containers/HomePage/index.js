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
  Icon,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  withStyles,
} from 'material-ui';

import LoadingBar from 'app/components/LoadingBar';
import PageBody from 'app/components/PageBody';
import MultiDayForecastComparison from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import CustomizeScoreForm from 'app/components/CustomizeScoreForm';
import EditComparisonDialog from 'app/components/EditComparisonDialog';
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
@withStyles({
  title: {flex: 1},
  customizeButton: {position: 'relative', top: 30},
})
export default class HomePage extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    comparison: AugmentedComparisonShape,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    comparison: null,
  };

  state = {
    showAddForm: false,
    showCustomizeForm: false,
    showMenu: false,
    menuAnchorEl: null,
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

  onClickAddLocation = () => {
    this.setState({showAddForm: !this.state.showAddForm});
  };

  hideAddForm = () => {
    this.setState({showAddForm: false});
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

  onClickMenu = event =>
    this.setState({showMenu: true, menuAnchorEl: event.currentTarget});
  onRequestCloseMenu = () => this.setState({showMenu: false});

  onClickCustomize = () => {
    this.onRequestCloseMenu();
    this.setState({showCustomizeForm: true});
  };
  onClickDoneCustomize = () => this.setState({showCustomizeForm: false});

  onClickSettings = () => {
    this.onRequestCloseMenu();
    this.setState({showEditDialog: true});
  };
  onRequestCloseEditDialog = () => this.setState({showEditDialog: false});

  render() {
    const {comparison} = this.props;
    const hasPoints =
      !comparison.isLoading &&
      comparison.comparisonPoints &&
      comparison.comparisonPoints.length > 0;
    return (
      <PageBody>
        <Grid container spacing={24} direction="column">
          <Grid item>
            <Card>
              <Toolbar>
                <Typography
                  type="title"
                  color="inherit"
                  className={this.props.classes.title}
                >
                  {comparison.name}
                </Typography>
                <div style={{position: 'relative'}}>
                  <IconButton color="contrast" onClick={this.onClickMenu}>
                    <Icon>more_vert</Icon>
                  </IconButton>
                  <Menu
                    open={this.state.showMenu}
                    onRequestClose={this.onRequestCloseMenu}
                    anchorEl={this.state.menuAnchorEl}
                  >
                    <MenuItem onClick={this.onClickCustomize}>
                      Customize Scoring
                    </MenuItem>
                    <MenuItem onClick={this.onClickSettings} divider>
                      Change Settings
                    </MenuItem>
                    <MenuItem onClick={this.onClickDelete}>
                      Delete Comparison
                    </MenuItem>
                  </Menu>
                </div>
                <EditComparisonDialog
                  comparison={comparison}
                  open={this.state.showEditDialog}
                  onRequestClose={this.onRequestCloseEditDialog}
                  type="edit"
                />
              </Toolbar>
              {comparison.isLoading && <LoadingBar />}
              <AssignToRouterContext
                contextKey="title"
                value={comparison.name}
              />
              <AssignToRouterContext
                contextKey="description"
                value={`Find out what the weather is at ${comparison.name}`}
              />

              {(this.state.showAddForm || this.state.showCustomizeForm) &&
                <CardContent>
                  {this.state.showAddForm &&
                    <InnerPane>
                      <AddComparisonPointForm
                        onClose={this.hideAddForm}
                        onAdd={this.onAddComparisonPoint}
                      />
                    </InnerPane>}
                  {this.state.showCustomizeForm &&
                    <InnerPane>
                      <CustomizeScoreForm
                        onClose={this.onClickDoneCustomize}
                        scoreConfig={comparison.scoreConfig}
                        onChange={this.onChangeScoreConfig}
                      />
                    </InnerPane>}
                </CardContent>}
              {hasPoints
                ? <CardContent>
                    <Typography>Daily Forecasts</Typography>
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
          <Grid item>
            {hasPoints &&
              <Card>
                <CardHeader title="Weekly Score Comparison" />
                <CardContent>
                  <ComparisonChart
                    comparison={comparison}
                    date={this.props.date}
                    onClickDate={this.onChangeDate}
                  />
                </CardContent>
              </Card>}
          </Grid>
        </Grid>
      </PageBody>
    );
  }
}
