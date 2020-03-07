import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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

import { capitalize, decimals, to2Fixed } from "../../Services/helpers";
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

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
        this.setState({ itemsAdded: [...this.state.itemsAdded, newItem], width: '60vw' })
      }
    } 
    if (this.props.type === "funds") {
      if (this.state.selectedDate && this.state.amount && this.state.account && this.state.source) {
        newItem['category']['name'] = null;
        newItem['type'] = accountSelected.type;
        newItem['source'] = this.state.source;
        this.setState({ itemsAdded: [...this.state.itemsAdded, newItem], width: '60vw' })
      }
    }
    this.clearAfterSubmit();
  }

  submitNew () {
    console.log("+++ 103 AddModal.js this.state.itemsAdded: ", JSON.stringify(this.state.itemsAdded, null, "\t"));
    if(this.props.type === "expenses"){
      console.log("+++ 137 AddModal.js expenses")
    }
    if (this.props.type === "funds") {
      console.log("+++ 140 AddModal.js funds")

    }
  }

  clearAfterSubmit () {
    this.setState({
      selectedDate: null,
      amount: "",
      comment: "",
      categoryId: "",
      source: "",
      account: {
        account: ""
      }
    })
  }

  removeFromItems (i) {
    var array = [...this.state.itemsAdded];
    if (i !== -1) {
      array.splice(i, 1);
      this.setState({itemsAdded: array}, () => {
        console.log("+++ 150 AddModal.js this.state.itemsAdded.length: ", this.state.itemsAdded.length)
        if(this.state.itemsAdded.length === 0){
          this.setState({width: '32vw'})
        }
      });
    }
  }

  render(){
    const { classes, userAccounts } = this.props;
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
                  <h2>Add {this.props.type}</h2>
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
                       style={this.props.type === "expenses" ? { display: 'block' } : { display: 'none' }}
                     >
                       {this.props.expensesCategories.map(cat => (
                         <MenuItem key={cat.id} value={cat}>
                           {capitalize(cat.name)}
                         </MenuItem>
                       ))}
                     </TextField>
                     <br style={this.props.type === "funds" ? { display: 'block' } : { display: 'none' }}/>
                     <TextField
                       fullWidth
                       id="source"
                       select
                       label="Select Source"
                       name="source"
                       value={this.state.source}
                       onChange={(e) => this.handleChange(e)}
                       style={this.props.type === "funds" ? { display: 'block' } : { display: 'none' }}
                     >
                       {this.props.fundSources.map(src => (
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
                <Grid item xs={7} className={classes.gridItem} style={this.state.itemsAdded.length > 0 ? {overflow: 'auto'} : {display: 'none'}}>
                  <Box>
                    <h2>{capitalize(this.props.type)} to add </h2>
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
                            <TableCell  align="right" style={this.props.type === "expenses" ? {} : { display: 'none' }}>
                              Category
                            </TableCell>
                            <TableCell  align="right" style={this.props.type === "funds" ? {} : { display: 'none' }}>
                              Source
                            </TableCell>
                            <TableCell  align="right">
                              Account
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
                              <TableCell align="right" style={this.props.type === "expenses" ? {} : { display: 'none' }}>
                                {capitalize(row.category.name)}
                              </TableCell>
                              <TableCell align="right" style={this.props.type === "funds" ? {} : { display: 'none' }}>
                                {capitalize(row.source.source)}
                              </TableCell>
                              <TableCell align="right">
                                {capitalize(row.account.account)}
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
                <Grid className={classes.root}>
                  <Box mt={2} pt={2} pl={1} pb={1} style={{'float': 'right'}} style={this.state.itemsAdded.length > 0 ? {} : {display: 'none'}}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={() => this.submitNew()}
                    >
                      Send
                    </Button>
                  </Box> 
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