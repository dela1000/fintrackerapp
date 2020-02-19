import React from 'react';
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

const handleComment = () => {

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

  const [category, setCategory] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [source, setSource] = React.useState("");

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const categoryChange = event => {
    setCategory(event.target.value);
  };

  const sourceChange = event => {
    setSource(event.target.value);
  };

  const accountChange = event => {
    setAccount(event.target.value);
  };


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
              onChange={handleAmount} value={props.amount} onKeyPress={onEnter} 
            />
            <br/>
            <TextField 
              fullWidth
              type="text" 
              name="comment" 
              id="outlined-basic" 
              label="Comment" 
              onChange={handleComment} value={props.comment} onKeyPress={onEnter} 
            />
            <br style={props.type === "expenses" ? { display: 'block' } : { display: 'none' }}/>
            <TextField
              fullWidth
              id="categories"
              select
              label="Select category"
              value={category}
              onChange={categoryChange}
              style={props.type === "expenses" ? { display: 'block' } : { display: 'none' }}
            >
              {props.expensesCategories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <br style={props.type === "funds" ? { display: 'block' } : { display: 'none' }}/>
            <TextField
              fullWidth
              id="sources"
              select
              label="Select Source"
              value={source}
              onChange={sourceChange}
              style={props.type === "funds" ? { display: 'block' } : { display: 'none' }}
            >
              {props.fundSources.map(src => (
                <MenuItem key={src.id} value={src.id}>
                  {src.source}
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
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.account}
                </MenuItem>
              ))}
            </TextField>
            <Box pl={1} pt={2} pb={1}>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                endIcon={<Icon>send</Icon>}
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


