import React from 'react';
import moment from 'moment';
import _ from 'lodash';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { capitalize, dateFormat } from "../../Services/helpers";


class TimeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCalendars: false,
      startDate: null,
      endDate: null,
      option: ""
    }
  };

  showCalendars = () => {
    if(this.state.showCalendars){
      this.setState({showCalendars: false})
    } else {
      this.setState({showCalendars: true})
    }
  }

  customOptions = [
    {name: "last month", value: 'lastMonth'},
    // {name: 'last 3 months', value: 'lastThreeMonths'},
    {name: 'year to date', value: 'yearToDate'},
    // {name: 'last year', value: 'lastYear'},
    // {name: 'all time', value: 'allTime'},
  ]

  handleDateChange (e, selectedDate) {
    let date = moment(selectedDate).format('MM-DD-YYYY');
    this.setState({[e]: date}, () => {
      this.callCustomDates();
    });
  };

  handleChange (e) { 
    let value = e.target.value;
    let selected = this.customOptions.find(x => x.value === e.target.value);
    let payload = {
      customOption: selected.name
    };
    if(value === "lastMonth"){
      payload['startDate'] = moment().subtract(1, 'months').startOf('month').format(dateFormat);
      payload['endDate'] = moment().subtract(1, 'months').endOf('month').format(dateFormat);
    }
    if(value === "lastThreeMonths"){
      payload['startDate'] = moment().subtract(90, 'days').format(dateFormat);
      payload['endDate'] = moment().format(dateFormat);
    }
    if(value === "yearToDate"){
      payload['startDate'] = moment().startOf('year').format(dateFormat);
      payload['endDate'] = moment().format(dateFormat);
    }
    if(value === "lastYear"){
      payload['startDate'] = moment().subtract(1, 'year').startOf('year').format(dateFormat);
      payload['endDate'] = moment().subtract(1, 'year').endOf('year').format(dateFormat);
    }
    

    this.props.updateCustom(payload)
    this.setState({[e.target.name]: value, startDate: null, endDate: null})
  }

  callCustomDates = () => {
    if(moment(this.state.endDate).isBefore(this.state.startDate)){
      console.log("+++ 45 TimeSelector.js FAIL")
      return;
    }
    if(this.state.startDate && this.state.endDate){
      let payload = {
        startDate: moment(this.state.startDate).format(dateFormat),
        endDate: moment(this.state.endDate).format(dateFormat),
        customOption: "custom dates"
      }
      this.props.updateCustom(payload);
    }
  }

  componentDidUpdate () {
    if(!this.props.open && this.state.showCalendars){
      this.setState({showCalendars: false})
    }
  }

  reset (){
    this.setState({ startDate: null, endDate: null, option: ""}, () => {
      this.props.updateCustom('reset');
    })
  }

  render () {
    const { open, timeframe, updateTimeframe } = this.props;
    return (
      <React.Fragment>
        <Grid 
          container 
          spacing={1} 
          direction="row"
          justify="space-between"
          alignItems="center"
          style={open ? {cursor: 'pointer', "marginTop": "5px"} : { display: 'none' }}
        >
          <Grid item xs>
            <Box pl={3} pt={0.5}>
              <Button
                size="small"
                color="primary"
                onClick={() => updateTimeframe(timeframe)}
              >
                View: {timeframe}
              </Button>
            </Box>
          </Grid>
          <Grid item xs>
            <Box pr={3} pt={0.5}>
              <Button
                size="small"
                color="primary"
                onClick={() => this.showCalendars()}
              >
                Custom Dates
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Grid 
          container
          direction="column"
          justify="center"
          spacing={1}
          style={this.state.showCalendars ? {} : { display: 'none' }}
        >
          <Box pr={4} pl={4}>
            <Grid item>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  fullWidth
                  autoOk
                  allowKeyboardControl
                  autoComplete="off"
                  margin="normal"
                  id="startDate"
                  label="Select Start Date"
                  format="MM-dd-yyyy"
                  name="startDate"
                  value={this.state.startDate}
                  KeyboardButtonProps={{ 'aria-label': 'change date' }}
                  onChange={(e, date) => this.handleDateChange('startDate', date)}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  fullWidth
                  autoOk
                  allowKeyboardControl
                  autoComplete="off"
                  margin="normal"
                  id="endDate"
                  label="Select End Date"
                  format="MM-dd-yyyy"
                  name="endDate"
                  value={this.state.endDate}
                  KeyboardButtonProps={{ 'aria-label': 'change date' }}
                  onChange={(e, date) => this.handleDateChange('endDate', date)}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                id="customOption"
                select
                label="Select a Custom Option"
                name="option"
                value={this.state.option}
                onChange={(e) => this.handleChange(e)}
              >
                {this.customOptions.map((option, i) => (
                  <MenuItem key={i} value={option.value}>
                    {capitalize(option.name)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Box>
        </Grid>
        <Grid 
          container
          spacing={1}
          style={this.state.showCalendars ? {} : { display: 'none' }}
        >
          <Box pl={3} pt={2}>
            <Button
              size="small"
              variant="contained"
              onClick={() => this.reset()}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </React.Fragment>
    )
  }
}

export default TimeSelector;

