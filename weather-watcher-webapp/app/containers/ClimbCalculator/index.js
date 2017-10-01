import React, {Component} from 'react';
import styled from 'styled-components';
import convert from 'convert-units';
import TextField from 'material-ui/TextField';
import Card, {CardContent, CardHeader, CardActions} from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import {withStyles} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Tabs, {Tab} from 'material-ui/Tabs';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import IconButton from 'material-ui/IconButton';

const Wrapper = styled.div``;

const STAGE_TYPES = {
  PITCH: 'Pitch',
  RAPPEL: 'Rappel',
  HIKE: 'Hike',
  CUSTOM: 'Custom',
  SEGMENT: 'Segment',
};

const wapass = [
  ['SEGMENT', 'Approach'],
  ['HIKE', 1.7, 2000],
  ['SEGMENT', 'NW Face of Liberty Bell'],
  ['PITCH', '5.5'],
  ['PITCH', '5.7'],
  ['PITCH', '5.8'],
  ['PITCH', '5.9'],
  ['PITCH', '5.1'],
  ['RAPPEL'],
  ['SEGMENT', 'North Face of Concord'],
  ['PITCH', '5.6'],
  ['PITCH', '5.7'],
  ['PITCH', '5.7'],
  ['RAPPEL'],
  ['SEGMENT', 'North Face of Lexington'],
  ['PITCH', '5.7'],
  ['PITCH', '5.7'],
  ['PITCH', '5.1'],
  ['RAPPEL'],
  ['SEGMENT', 'NW Corner of N.E.W.S.'],
  ['PITCH', '5.8', '45m'],
  ['PITCH', '5.9', '50m'],
  ['PITCH', '5.9', '30m'],
  ['PITCH', '5.9', '25m'],
  ['PITCH', '4th', '30m'],
  ['RAPPEL'],
  ['SEGMENT', 'SW Rib of S.E.W.S.'],
  ['PITCH', '5.8', '50m'],
  ['PITCH', '5.8', '30m'],
  ['PITCH', '5.6', '15m'],
  ['PITCH', '5.6', '60m'],
  ['PITCH', '5.7', '50m'],
  ['PITCH', '5.5', '25m'],
  ['PITCH', '5.5', '20m'],
  ['RAPPEL'],
  ['SEGMENT', 'Descent'],
  ['HIKE', 1, -2000],
];

const initialState = {
  stages: wapass.map(([type, ...args], index) => {
    const stage = {id: index + 1, type};
    if (type === 'HIKE') {
      const [distance, elevation] = args;
      return {...stage, distance, elevation};
    } else if (type === 'PITCH') {
      const [grade, height] = args;
      return {...stage, grade, height};
    } else if (type === 'RAPPEL') {
      return {...stage, height: 100};
    }
    const [name, minDuration, maxDuration] = args;
    return {...stage, name, minDuration, maxDuration};
  }),
  //  stages: [],
  type: 'PITCH',
  grade: '',
  height: '',
  distance: '',
  elevation: '',
  duration: '',
  startTime: `${5 * 60}`,
  minTimePerPitch: '20',
  maxTimePerPitch: '60',
  minTimePerRappel: '10',
  maxTimePerRappel: '25',
  minTimePerDistance: '20',
  maxTimePerDistance: '40',
};

function formatTime(time) {
  const hours = time / 60;
  const days = Math.floor(hours / 24);
  const hoursMod12 = Math.floor(hours) % 12;
  const minutes = Math.floor(time % 60);
  return [
    hoursMod12 === 0 ? 12 : hoursMod12,
    ':',
    minutes === 0 ? '00' : minutes < 10 ? `0${minutes}` : minutes,
    hours % 24 < 12 ? 'am' : 'pm',
    days > 0 ? ` +${days} ${days === 1 ? 'day' : 'days'}` : '',
  ].join('');
}

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    width: '100%',
  },
});

const Cell = styled(TableCell)``;

const Segment = styled(TableRow)`
  border-bottom: 2px solid #ccc;
`;

const SegmentCellWrapper = Cell.extend`
  padding-top: 25px;
  &:first-child {
    padding: 25px 5px 5px;
  }
`;

const SegmentCell = withStyles({
  padding: {
    paddingTop: 25,
  },
})(function SegmentCell({children, ...props}) {
  return (
    <Cell {...props}>
      <Typography color="inherit" type="subheading">
        {children}
      </Typography>
    </Cell>
  );
});

function SegmentRow({stage}) {
  return (
    <Segment>
      <SegmentCell colSpan={2}>
        {stage.name}
      </SegmentCell>
      <SegmentCell>
        +{stage.minDuration}-{stage.maxDuration} mins
      </SegmentCell>
      <SegmentCell>
        {stage.minTimeStr}/{stage.maxTimeStr}
      </SegmentCell>
      <Cell>
        <IconButton color="accent">
          <DeleteIcon />
        </IconButton>
      </Cell>
    </Segment>
  );
}

export default class App extends Component {
  state = {
    ...initialState,
  };

  onChange = event => {
    this.setState({[event.target.name]: event.target.value});
  };

  onChangeTime = event => {
    console.log('got time change event', event.target);
  };

  addStage = () => {
    const {type, stages, grade, name} = this.state;
    let {height, distance, elevation, minDuration, maxDuration} = this.state;
    height = parseInt(height, 10);
    distance = parseInt(distance, 10);
    elevation = parseInt(elevation, 10);
    minDuration = parseInt(minDuration, 10);
    maxDuration = parseInt(maxDuration, 10);
    this.setState({
      ...initialState,
      stages: [
        ...stages,
        {
          id: stages.length + 1,
          type,
          ...(type === 'PITCH'
            ? {height, grade}
            : type === 'HIKE'
              ? {distance, elevation}
              : type === 'RAPPEL'
                ? {height}
                : type === 'CUSTOM'
                  ? {name, minDuration, maxDuration}
                  : type === 'SEGMENT' ? {name} : {}),
        },
      ],
    });
  };

  getStageData() {
    let minTime = parseInt(this.state.startTime, 10);
    let maxTime = minTime;
    let typeCount = 1;
    let stages = [];
    let index = 0;

    const appendStageData = stage => {
      let minDuration = 0;
      let maxDuration = 0;
      if (stage.type === 'PITCH') {
        minDuration = parseInt(this.state.minTimePerPitch, 10);
        maxDuration = parseInt(this.state.maxTimePerPitch, 10);
      } else if (stage.type === 'HIKE') {
        // See munter method of time estimation:
        // http://www.mountainschoolnews.com/2010/04/route-planning-how-to.html
        let units =
          convert(stage.distance).from('mi').to('km') +
          convert(Math.abs(stage.elevation)).from('ft').to('m') / 100;
        const divisor = stage.elevation > 0 ? 4 : 6;
        const minutes = units / divisor * 60;
        minDuration = Math.round(minutes * 0.9);
        maxDuration = Math.round(minutes * 1.1);
      } else if (stage.type === 'RAPPEL') {
        minDuration = parseInt(this.state.minTimePerRappel, 10);
        maxDuration = parseInt(this.state.maxTimePerRappel, 10);
      } else if (stage.type === 'CUSTOM') {
        minDuration = parseInt(stage.minDuration, 10);
        maxDuration = parseInt(stage.maxDuration, 10);
      } else if (stage.type === 'SEGMENT') {
        stages.push(stage);
        typeCount = 0;
        let substages = [];
        while (
          index < this.state.stages.length &&
          this.state.stages[index].type !== 'SEGMENT'
        ) {
          const substage = appendStageData(this.state.stages[index++]);
          minDuration += substage.minDuration;
          maxDuration += substage.maxDuration;
        }
        Object.assign(stage, {
          minTime,
          maxTime,
          minTimeStr: formatTime(minTime),
          maxTimeStr: formatTime(maxTime),
          minDuration,
          maxDuration,
        });
        return stage;
      }
      minTime += minDuration;
      maxTime += maxDuration;
      if (index > 0 && this.state.stages[index - 1].type === stage.type) {
        typeCount++;
      } else {
        typeCount = 1;
      }
      stage = {
        ...stage,
        minTime,
        maxTime,
        minTimeStr: formatTime(minTime),
        maxTimeStr: formatTime(maxTime),
        minDuration,
        maxDuration,
        count: typeCount,
      };
      stages.push(stage);
      return stage;
    };
    while (index < this.state.stages.length) {
      appendStageData(this.state.stages[index++]);
    }
    return stages;
  }

  setter = (name, value) => () => this.onChange({target: {name, value}});

  render() {
    return (
      <Wrapper>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <AppBar position="static">
              <Toolbar>
                <Typography type="title" color="inherit">
                  Climb Time Calculator
                </Typography>
              </Toolbar>
            </AppBar>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={24}>
              <Grid item xs={8}>
                <Card>
                  <CardHeader title="Climbing Stages" />
                  <CardContent>
                    <Button
                      raised
                      onClick={this.setter('collapse', !this.state.collapse)}
                    >
                      {this.state.collapse ? 'expand' : 'collapse'}
                    </Button>
                  </CardContent>
                  <CardContent>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <Cell>Stage</Cell>
                          <Cell>Notes</Cell>
                          <Cell>Duration</Cell>
                          <Cell>Time</Cell>
                          <Cell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.getStageData()
                          .filter(
                            stage =>
                              !this.state.collapse || stage.type === 'SEGMENT'
                          )
                          .map(
                            stage =>
                              stage.type === 'SEGMENT'
                                ? <SegmentRow key={stage.id} stage={stage} />
                                : <TableRow key={stage.id}>
                                    <Cell>
                                      {stage.type === 'CUSTOM'
                                        ? stage.name
                                        : `${STAGE_TYPES[
                                            stage.type
                                          ]} ${stage.count}`}
                                    </Cell>
                                    <Cell>
                                      {stage.type === 'PITCH' &&
                                        <div>
                                          {stage.height &&
                                            <span>
                                              Height: {stage.height},{' '}
                                            </span>}
                                          Grade: {stage.grade}
                                        </div>}
                                      {stage.type === 'HIKE' &&
                                        <div>
                                          Distance: {stage.distance} miles,
                                          Elevation: {stage.elevation} ft
                                        </div>}
                                      {stage.type === 'RAPPEL' &&
                                        <div>
                                          Height: {stage.height} ft
                                        </div>}
                                    </Cell>
                                    <Cell>
                                      +{stage.minDuration}-{stage.maxDuration}{' '}
                                      mins
                                    </Cell>
                                    <Cell>
                                      {stage.minTimeStr}/{stage.maxTimeStr}
                                    </Cell>
                                    <Cell>foo</Cell>
                                  </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={24}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Add Climbing Stage" />
                      <Tabs
                        value={this.state.type}
                        scrollable
                        scrollButtons="auto"
                        onChange={(e, value) =>
                          this.onChange({target: {name: 'type', value}})}
                      >
                        {Object.keys(STAGE_TYPES).map(key =>
                          <Tab key={key} value={key} label={STAGE_TYPES[key]} />
                        )}
                      </Tabs>
                      <CardContent>
                        {this.state.type === 'PITCH' &&
                          <Grid item xs={6}>
                            <TextField
                              name="height"
                              type="text"
                              label="Height (in feet)"
                              value={this.state.height}
                              onChange={this.onChange}
                              fullWidth
                            />
                            <TextField
                              label="Grade (YDS)"
                              name="grade"
                              type="text"
                              value={this.state.grade}
                              onChange={this.onChange}
                              fullWidth
                            />
                          </Grid>}
                        {this.state.type === 'RAPPEL' &&
                          <Grid xs={6}>
                            <TextField
                              label="Height (in feet)"
                              name="height"
                              type="text"
                              value={this.state.height}
                              onChange={this.onChange}
                              fullWidth
                            />
                          </Grid>}
                        {this.state.type === 'HIKE' &&
                          <Grid xs={6}>
                            <TextField
                              label="Distance (in miles)"
                              name="distance"
                              type="text"
                              value={this.state.distance}
                              onChange={this.onChange}
                              fullWidth
                            />
                            <TextField
                              label="Elevation (in feet)"
                              name="elevation"
                              type="text"
                              value={this.state.elevation}
                              onChange={this.onChange}
                              fullWidth
                            />
                          </Grid>}
                        {this.state.type === 'CUSTOM' &&
                          <Grid xs={6}>
                            <TextField
                              label="Name"
                              name="name"
                              type="text"
                              value={this.state.name}
                              onChange={this.onChange}
                              fullWidth
                            />
                            <TextField
                              label="Duration (Min)"
                              name="minDuration"
                              type="text"
                              value={this.state.minDuration}
                              onChange={this.onChange}
                              fullWidth
                            />
                            <TextField
                              label="Duration (Max)"
                              name="maxDuration"
                              type="text"
                              value={this.state.maxDuration}
                              onChange={this.onChange}
                              fullWidth
                            />
                          </Grid>}
                      </CardContent>
                      <CardActions>
                        <Button raised color="primary" onClick={this.addStage}>
                          Add {STAGE_TYPES[this.state.type]}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Settings" />
                      <CardContent>
                        <TextField
                          type="time"
                          label="Start Time"
                          name="startTime"
                          value={this.state.startTime}
                          onChange={this.onChangeTime}
                        />
                        <TextField
                          fullWidth
                          label="Time Per Pitch (min)"
                          type="text"
                          name="minTimePerPitch"
                          value={this.state.minTimePerPitch}
                          onChange={this.onChange}
                        />
                        <TextField
                          fullWidth
                          label="Time Per Pitch (max)"
                          type="text"
                          name="maxTimePerPitch"
                          value={this.state.maxTimePerPitch}
                          onChange={this.onChange}
                        />
                        <TextField
                          fullWidth
                          label="Time Per Rappel (min)"
                          type="text"
                          name="minTimePerRappel"
                          value={this.state.minTimePerRappel}
                          onChange={this.onChange}
                        />
                        <TextField
                          fullWidth
                          label="Time Per Rappel (max)"
                          type="text"
                          name="maxTimePerRappel"
                          value={this.state.maxTimePerRappel}
                          onChange={this.onChange}
                        />
                        <TextField
                          fullWidth
                          label="Time Per mile of hiking (min)"
                          type="text"
                          name="minTimePerDistance"
                          value={this.state.minTimePerDistance}
                          onChange={this.onChange}
                        />
                        <TextField
                          fullWidth
                          label="Time Per mile of hiking (max)"
                          type="text"
                          name="maxTimePerDistance"
                          value={this.state.maxTimePerDistance}
                          onChange={this.onChange}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Wrapper>
    );
  }
}
