import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { dateFormat } from "../../Services/helpers";

class TimeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCalendars: true,
      startDate: null,
      endDate: null,
    }
  };

  showCalendars = () => {
    if(this.state.showCalendars){
      this.setState({showCalendars: false})
    } else {
      this.setState({showCalendars: true})
    }
  }

  handleDateChange (e, selectedDate) {
    let date = moment(selectedDate).format('MM-DD-YYYY');
    this.setState({[e]: date}, () => {
      this.callCustomDates();
    });
  };

  callCustomDates = () => {
    if(moment(this.state.endDate).isBefore(this.state.startDate)){
      console.log("+++ 45 TimeSelector.js FAIL")
      return;
    }
    if(this.state.startDate && this.state.endDate){
      var payload = {
        startDate: moment(this.state.startDate).format(dateFormat),
        endDate: moment(this.state.endDate).format(dateFormat),
      }
    }
    console.log("+++ 56 TimeSelector.js payload: ", payload)
  }


  render () {
    const { open, timeframe } = this.props;
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
                color="primary"
                onClick={() => this.props.updateTimeframe(timeframe)}
              >
                View: {timeframe}
              </Button>
            </Box>
          </Grid>
          <Grid item xs>
            <Box pr={3} pt={0.5}>
              <Button
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
          alignItems="center"
          spacing={1}
          style={this.state.showCalendars ? {} : { display: 'none' }}
        >
          <Grid item xs>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                autoFocus
                fullWidth
                autoOk
                allowKeyboardControl
                autoComplete="off"
                margin="normal"
                id="date-picker-dialog"
                label="Select Start Date"
                format="MM-dd-yyyy"
                name="startDate"
                value={this.state.startDate}
                KeyboardButtonProps={{ 'aria-label': 'change date' }}
                onChange={(e, date) => this.handleDateChange('startDate', date)}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs>
           <MuiPickersUtilsProvider utils={DateFnsUtils}>
             <KeyboardDatePicker
               autoFocus
               fullWidth
               autoOk
               allowKeyboardControl
               autoComplete="off"
               margin="normal"
               id="date-picker-dialog"
               label="Select End Date"
               format="MM-dd-yyyy"
               name="endDate"
               value={this.state.endDate}
               KeyboardButtonProps={{ 'aria-label': 'change date' }}
               onChange={(e, date) => this.handleDateChange('endDate', date)}
             />
           </MuiPickersUtilsProvider>
           </Grid>
        </Grid>
      </React.Fragment>
    )
  }
}

export default TimeSelector;

