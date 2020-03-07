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

  },
  gridItem: {
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(2),
  }
});


class AddModal extends React.Component {

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
    if(value === true){
      this.definePrimaryAccount();
    } else {
      this.clearAfterSubmit();
      this.removeAll();
    }
    this.setState({ open: value });
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
  
  addMore () {
    var accountSelected = this.props.userAccounts.find(x => x.id === this.state.account.id);
    if(accountSelected){
      var newItem = {
        date: moment(this.state.selectedDate).format('MM-DD-YYYY'),
        amount: this.state.amount,
        comment: this.state.comment || null, 
        account: accountSelected,
        category: {},
        type: {},
        source: {},
      }
    } else {
      return;
    }
    if(this.props.type === "expenses"){
      if(this.state.selectedDate && this.state.amount && this.state.account && this.state.categoryId){
        newItem['category'] = this.state.categoryId;
        this.setState({ itemsAdded: [...this.state.itemsAdded, newItem], width: '90vw' })
      }
    } 
    if (this.props.type === "funds") {
      if (this.state.selectedDate && this.state.amount && this.state.account && this.state.source) {
        newItem['category']['name'] = null;
        newItem['type'] = accountSelected.type;
        newItem['source'] = this.state.source;
        this.setState({ itemsAdded: [...this.state.itemsAdded, newItem], width: '90vw' })
      }
    }
    this.clearAfterSubmit();
  }

  submitNew () {
    if(this.state.itemsAdded.length > 0) {
      if(this.props.type === "expenses"){
        var payload = [];
        _.forEach(this.state.itemsAdded, (item) => {
          payload.push({
            "date": item.date,
            "amount": Number(to2Fixed(item.amount)),
            "comment": item.comment,
            "categoryId": item.category.id,
            "accountId": item.account.id,
          })
        })
        console.log("+++ 150 AddModal.js payload: ", JSON.stringify(payload, null, "\t"));
        post_expenses_bulk(payload)
          .then((res) => {
            var data = res.data;
            console.log("+++ 154 AddModal.js res.data: ", JSON.stringify(res.data, null, "\t"));
            if(data.success){
              this.props.getAllTotals();
              this.clearAfterSubmit();
              this.handleOpen(false);
            } else {
              console.log("+++ 156 AddModal.js data: ", data)
            }
          })
      }
      if (this.props.type === "funds") {
        var payload = [];
        _.forEach(this.state.itemsAdded, (item) => {
          payload.push({
            "date": item.date,
            "amount": Number(to2Fixed(item.amount)),
            "comment": item.comment,
            "sourceId": item.source.id,
            "accountId": item.account.id,
            "typeId": item.account.typeId,
          })
        })
        console.log("+++ 161 AddModal.js payload: ", JSON.stringify(payload, null, "\t"));
        post_funds_bulk(payload)
          .then((res) => {
            var data = res.data;
            if(data.success){
              this.props.getAllTotals();
              this.clearAfterSubmit();
              this.handleOpen(false);
            } else {
              console.log("+++ 177 AddModal.js data: ", data)
            }
          })
      }

    }
  }

  clearAfterSubmit () {
    this.setState({
      selectedDate: null,
      amount: "",
      comment: "",
      categoryId: "",
      source: "",
      account: this.state.primaryAccount,
    })
  }

  removeFromItems (i) {
    var array = [...this.state.itemsAdded];
    if (i !== -1) {
      array.splice(i, 1);
      this.setState({itemsAdded: array}, () => {
        if(this.state.itemsAdded.length === 0){
          this.setState({width: '32vw'})
        }
      });
    }
  }

  removeAll () {
    this.setState({ itemsAdded: [] }, () => {
      if(this.state.itemsAdded.length === 0){
        this.setState({width: '32vw'})
      }
    });
  }

  definePrimaryAccount () {
    var primaryAccount = this.props.userAccounts.find(x => x.primary === true);
    this.setState({account: primaryAccount, primaryAccount: primaryAccount})
  }

  render(){
    const { classes, type, userAccounts, expensesCategories, fundSources } = this.props;
    return (
      <div>
        <AddCircleIcon onClick={() => this.handleOpen(true)} />
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
                  <h2>Add {type}</h2>
                  <Box style={{height: '260px'}}>
                    <Grid container justify="center" spacing={2}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                         <KeyboardDatePicker
                           fullWidth
                           autoOk
                           allowKeyboardControl
                           autoComplete="off"
                           margin="normal"
                           id="date-picker-dialog"
                           label="Select Date of Transaction"
                           format="MM-dd-yyyy"
                           value={this.state.selectedDate}
                           KeyboardButtonProps={{ 'aria-label': 'change date', }}
                           onChange={(date) => this.handleDateChange(date)}
                         />
                     </MuiPickersUtilsProvider>
                     <TextField 
                       fullWidth
                       type="number" 
                       name="amount" 
                       id="outlined-basic" 
                       label="Amount" 
                       autoComplete="off"
                       value={this.state.amount} 
                       onChange={(e) => this.handleChange(e)} 
                     />
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
                     <br/>
                     <TextField
                       fullWidth
                       id="categories"
                       select
                       label="Select category"
                       name="categoryId"
                       value={this.state.categoryId}
                       onChange={(e) => this.handleChange(e)}
                       style={type === "expenses" ? { display: 'block' } : { display: 'none' }}
                     >
                       {expensesCategories.map(cat => (
                         <MenuItem key={cat.id} value={cat}>
                           {capitalize(cat.name)}
                         </MenuItem>
                       ))}
                     </TextField>
                     <br style={type === "funds" ? { display: 'block' } : { display: 'none' }}/>
                     <TextField
                       fullWidth
                       id="source"
                       select
                       label="Select Source"
                       name="source"
                       value={this.state.source}
                       onChange={(e) => this.handleChange(e)}
                       style={type === "funds" ? { display: 'block' } : { display: 'none' }}
                     >
                       {fundSources.map(src => (
                         <MenuItem key={src.id} value={src}>
                           {capitalize(src.source)}
                         </MenuItem>
                       ))}
                     </TextField>
                     <br/>
                     <TextField
                       fullWidth
                       id="account"
                       select
                       label="Select Account"
                       name="account"
                       value={this.state.account || ''}
                       onChange={(e) => this.handleChange(e)}
                     >
                       {userAccounts.map(acc => (
                         <MenuItem key={acc.id} value={acc}>
                           {capitalize(acc.account)} - {capitalize(acc.type)}
                         </MenuItem>
                       ))}
                     </TextField>
                        
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={8} className={classes.gridItem} style={this.state.itemsAdded.length > 0 ? {overflow: 'auto'} : {display: 'none'}}>
                  <Box>
                    <h2>{capitalize(type)} to add</h2>
                    <TableContainer style={{overflow: 'auto'}}>
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Date
                            </TableCell>
                            <TableCell align="right">
                              Amount
                            </TableCell>
                            <TableCell  align="right">
                              Comment
                            </TableCell>
                            <TableCell  align="right" style={type === "expenses" ? {} : { display: 'none' }}>
                              Category
                            </TableCell>
                            <TableCell  align="right" style={type === "funds" ? {} : { display: 'none' }}>
                              Source
                            </TableCell>
                            <TableCell  align="right">
                              Account
                            </TableCell>
                            <TableCell  align="right">
                              Type
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.itemsAdded.map((row, i) => (
                            <TableRow key={i} onClick={() => this.removeFromItems(i)} style={{cursor: 'pointer'}}>
                              <TableCell  component="th" scope="row">
                                {moment(row.date).format('MM-DD-YYYY')}
                              </TableCell>
                              <TableCell align="right">
                                {decimals(row.amount)}
                              </TableCell>
                              <TableCell align="right">
                                {row.comment}
                              </TableCell>
                              <TableCell align="right" style={type === "expenses" ? {} : { display: 'none' }}>
                                {capitalize(row.category.name)}
                              </TableCell>
                              <TableCell align="right" style={type === "funds" ? {} : { display: 'none' }}>
                                {capitalize(row.source.source)}
                              </TableCell>
                              <TableCell align="right">
                                {capitalize(row.account.account)}
                              </TableCell>
                              <TableCell align="right">
                                {capitalize(row.account.type)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
                      className={classes.button}
                      onClick={() => this.addMore()}
                    >
                      Add
                    </Button>
                  </Box> 
                </Grid>
                <Grid className={classes.root} style={this.state.itemsAdded.length > 0 ? {} : {display: 'none'}}>
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
                          className={classes.button}
                          onClick={() => this.removeAll()}
                        >
                          Remove All
                        </Button>
                      </Box> 
                    </Grid>
                    <Grid className={classes.root}>
                      <Box mt={2} pt={2} pl={1} pb={1} style={{'float': 'right'}}>
                        <Button
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={() => this.submitNew()}
                        >
                          Submit
                        </Button>
                      </Box> 
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          </Fade>
        </Modal>
      </div>
    );
  }
}

AddModal.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddModal);