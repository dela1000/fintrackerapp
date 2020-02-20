import React from 'react';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import TextField from '@material-ui/core/TextField';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { capitalize, decimals } from "../Services/helpers";
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

import axios from 'axios';
import { post_expenses_bulk, post_funds_bulk } from "../Services/WebServices";

const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    padding: theme.spacing(1, 1, 1),
  },
}));

const handleAmount = () => {

}

const onEnter = () => {
  
}


export default function AddModal(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [categoryId, setCategory] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [sourceId, setSource] = React.useState("");

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const handleAmount = (event) => {
    setAmount(event.target.value);
  }

  const handleComment = (event) => {
    setComment(event.target.value);
  }

  const categoryChange = event => {
    setCategory(event.target.value);
  };

  const sourceChange = event => {
    setSource(event.target.value);
  };

  const accountChange = event => {
    setAccount(event.target.value);
  };

  const submitNew = (event) => {
    event.preventDefault();
    if(!selectedDate || !amount || !account){
      return;
    } 
    
    var accountSelected = props.userAccounts.find(x => x.account === account);
    console.log("+++ 123 AddModal.js accountSelected: ", accountSelected)

    if (props.type === "expenses") {
      if(!categoryId){
        return;
      } else {
        var payload = [{
          date: moment(selectedDate).format('MM-DD-YYYY'),
          amount: Number(amount),
          comment: comment || null, 
          accountId: accountSelected.id,
          categoryId: categoryId
        }];
        post_expenses_bulk(payload)
          .then((res) => {
            var data = res.data;
            if(data.success){
              props.getExpenses();
              handleClose();
              return;
            }
          })
      }
    }
    if (props.type === "funds") {
      if(!sourceId){
        return;
      } else {
        var payload = [{
          date: moment(selectedDate).format('MM-DD-YYYY'),
          amount: Number(amount),
          comment: comment || null,
          accountId: accountSelected.id,
          typeId: accountSelected.typeId,
          sourceId: sourceId
        }];
        console.log("+++ 133 AddModal.js payload: ", payload)
        post_funds_bulk(payload)
          .then((res) => {
            var data = res.data;
            if(data.success){
              // props.getExpenses();
              handleClose();
            }
          })
      }
    }
  }

  return (
    <div>
      <AddCircleIcon onClick={handleOpen} />
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
        timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <h2>Add {capitalize(props.type)}</h2>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid container justify="space-around">
                <KeyboardDatePicker
                  margin="normal"
                  id="date-picker-dialog"
                  label="Select Date of Transaction"
                  format="MM-dd-yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
              </Grid>
            </MuiPickersUtilsProvider>
            <TextField 
              fullWidth
              type="number" 
              name="amount" 
              id="outlined-basic" 
              label="Amount" 
              autoComplete="off"
              onChange={handleAmount} value={props.amount} onKeyPress={onEnter} 
            />
            <br/>
            <TextField 
              fullWidth
              type="text" 
              name="comment" 
              id="outlined-basic" 
              label="Comment" 
              autoComplete="off"
              onChange={handleComment} value={props.comment} onKeyPress={onEnter} 
            />
            <br/>
            <TextField
              fullWidth
              id="categories"
              select
              label="Select category"
              value={categoryId}
              onChange={categoryChange}
              style={props.type === "expenses" ? { display: 'block' } : { display: 'none' }}
            >
              {props.expensesCategories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {capitalize(cat.name)}
                </MenuItem>
              ))}
            </TextField>
            <br style={props.type === "funds" ? { display: 'block' } : { display: 'none' }}/>
            <TextField
              fullWidth
              id="sources"
              select
              label="Select Source"
              value={sourceId}
              onChange={sourceChange}
              style={props.type === "funds" ? { display: 'block' } : { display: 'none' }}
            >
              {props.fundSources.map(src => (
                <MenuItem key={src.id} value={src.id}>
                  {capitalize(src.source)}
                </MenuItem>
              ))}
            </TextField>
            <br/>
            <TextField
              fullWidth
              id="accounts"
              select
              label="Select account"
              value={account}
              onChange={accountChange}
            >
              {props.userAccounts.map(acc => (
                <MenuItem key={acc.id} value={acc.account}>
                  {capitalize(acc.account)} - {capitalize(acc.type)}
                </MenuItem>
              ))}
            </TextField>
            <Box pl={1} pt={2} pb={1}>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                endIcon={<Icon>send</Icon>}
                onClick={submitNew}
              >
                Send
              </Button>
            </Box> 
          </div>
        </Fade>
      </Modal>
    </div>
  );
}


