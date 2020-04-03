import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import ImportExportIcon from '@material-ui/icons/ImportExport';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { capitalize, to2Fixed, dateFormat } from "../../Services/helpers";
import { transfers } from "../../Services/WebServices";

const styles = theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    padding: theme.spacing(8, 8, 8),
    borderRadius: '10px'

  },
  gridItem: {
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(2),
  }
});


class TransferModal extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      classes: {},
      open: false,
      amount: "",
      selectedDate: null,
      comment: "",
      fromAccount: {
        account: ""
      },
      toAccount: {
        account: ""
      },
      width: '60vw',
      message: ""
    }
  }


  handleOpen(value) {
    this.setState({ open: value });
    if(!value){
      this.clear();
    }
  };

  handleDateChange (e) {
    let date = moment(e).format('MM-DD-YYYY');
    this.setState({selectedDate: date});
  };

  handleChange (e) {
    var value = e.target.value;
    if(e.target.name === 'amount'){
      value = to2Fixed(e.target.value)
    }
    this.setState({[e.target.name]: value})
  }


  submitTransfer = evt => {
    evt.preventDefault();
    var amount = Number(this.state.amount);
    if(amount < 1){
      this.failMessage("Amount needs to be positive and more than zero")
      return;
    }
    if(!this.state.fromAccount.id){
      this.failMessage("Select a From account");
      return;
    }
    if(!this.state.toAccount.id){
      this.failMessage("Select a To account");
      return;
    }
    if(!this.state.selectedDate){
      this.failMessage("Select Date");
      return;
    }
    if(this.state.fromAccount.id === this.state.toAccount.id){
      this.failMessage("Please select accounts for both From and To");
      return;
    }
    var fixedAmount = to2Fixed(this.state.amount)
    var payload = {
      fromAccountId: this.state.fromAccount.id,
      toAccountId: this.state.toAccount.id,
      date: moment(this.state.selectedDate).format(dateFormat),
      comment: this.state.comment,
      amount: fixedAmount,
    }
    transfers(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.props.getAllTotals();
          this.handleOpen(false);
        } else {
          console.log("+++ 141 TransferModal.js data: ", data)
          this.failMessage(data.message);
        }
      })

  }

  failMessage = (message) => {
    this.setState({message: message}, () => {
      setTimeout( () => {
        this.setState({message: ""})
      }, 2500)
    })
  }

  clear () {
    this.setState({
      amount: "",
      fromAccount: {
        account: ""
      },
      toAccount: {
        account: ""
      },
      selectedDate: null,
      comment: "",
    })
  }

  render(){
    const { classes, userAccounts } = this.props;
    return (
      <div>
        <ImportExportIcon onClick={() => this.handleOpen(true)} />
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={this.state.open}
          onClose={() => this.handleOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={this.state.open}>
            <div className={classes.paper} style={{width: this.state.width}}>
              <form onSubmit={this.submitTransfer}>
                <Grid container>
                  <Grid item xs className={classes.gridItem}>
                    <h2>TRANSFER</h2>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs className={classes.gridItem}>
                    <TextField
                      required
                      autoFocus
                      fullWidth
                      id="from"
                      select
                      label="From Account"
                      name="fromAccount"
                      value={this.state.fromAccount || ''}
                      onChange={(e) => this.handleChange(e)}
                    >
                      {userAccounts.map(acc => (
                        <MenuItem key={acc.id} value={acc}>
                          {capitalize(acc.account)} - {capitalize(acc.type)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs className={classes.gridItem}>
                    <TextField
                      required
                      fullWidth
                      id="to"
                      select
                      label="To Account"
                      name="toAccount"
                      value={this.state.toAccount || ''}
                      onChange={(e) => this.handleChange(e)}
                    >
                      {userAccounts.map(acc => (
                        <MenuItem key={acc.id} value={acc}>
                          {capitalize(acc.account)} - {capitalize(acc.type)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid 
                  container
                  direction="row"
                  alignItems="center"
                >
                  <Grid item xs className={classes.root}>
                    <Box mt={3} pt={3} pl={1} pb={1}>
                      <TextField
                        required 
                        fullWidth
                        type="number" 
                        name="amount" 
                        id="outlined-basic" 
                        label="Amount" 
                        autoComplete="off"
                        value={this.state.amount} 
                        onChange={(e) => this.handleChange(e)} 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs className={classes.root}>
                    <Box pt={1} pl={1} >
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          autoOk
                          allowKeyboardControl
                          autoComplete="off"
                          margin="normal"
                          id="date-picker-dialog"
                          label="Select Date of Transfer"
                          format="MM-dd-yyyy"
                          value={this.state.selectedDate || null}
                          KeyboardButtonProps={{ 'aria-label': 'change date' }}
                          onChange={(date) => this.handleDateChange(date)}
                      />
                      </MuiPickersUtilsProvider>
                    </Box> 
                  </Grid>
                  <Grid item xs className={classes.root}>
                    <Box mt={3} pt={3} pl={1} pb={1}>
                      <TextField
                        fullWidth
                        type="text" 
                        name="comment" 
                        id="outlined-basic" 
                        label="Comment" 
                        autoComplete="off"
                        value={this.state.comment} 
                        onChange={(e) => this.handleChange(e)} 
                      />
                    </Box> 
                  </Grid>
                </Grid>
                <Grid 
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid className={classes.root}>
                    <Box mt={2} pt={2} pl={1} pb={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.clear()}
                      >
                        Clear
                      </Button>
                    </Box> 
                  </Grid>
                  <Grid className={classes.root}>
                    <Box mt={2} pt={2} pl={1} pb={1} style={{'float': 'right'}}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Submit
                      </Button>
                    </Box> 
                  </Grid>
                </Grid>
                <Grid 
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid className={classes.root}>
                    <p style={this.state.message.length > 0 ? {} : {display: 'none'}}>
                      {this.state.message}
                    </p>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Fade>
        </Modal>
      </div>
    );
  }
}

TransferModal.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TransferModal);