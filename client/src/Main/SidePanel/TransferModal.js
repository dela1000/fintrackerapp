import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash'

import { makeStyles, withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ImportExportIcon from '@material-ui/icons/ImportExport';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { capitalize, decimals, to2Fixed, formatDate } from "../../Services/helpers";
import { post_expenses_bulk, post_funds_bulk } from "../../Services/WebServices";

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
      selectedDate: null,
      amount: "",
      comment: "",
      categoryId: "",
      source: "",
      account: {
        account: ""
      },
      itemsAdded: [],
      width: '32vw'
    }
  }


  handleOpen(value) {
    this.setState({ open: value });
  };

  handleChange (e) {
    var value = e.target.value;
    if(e.target.name === 'amount'){
      value = to2Fixed(e.target.value)
    }
    this.setState({[e.target.name]: value})
  }


  submitTransfer () {
    
  }

  clearAfterSubmit () {
    this.setState({
      amount: "",
      comment: "",
    })
  }

  render(){
    const { classes, type, userAccounts, expensesCategories, fundSources } = this.props;
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
              <Grid container justify="space-around">
                <Grid item xs className={classes.gridItem}>
                  <h2>TRANSFER</h2>
                  
                </Grid>
              </Grid>
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