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

export default function AddModal(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  console.log("+++ 41 AlertModal.js props.typeIdMissing: ", props.typeIdMissing)

  if(props.typeIdMissing) {
    if(!open){
      setOpen(true);
    }
  }

  const handleClose = () => {
    props.closeWarning();
    setOpen(false);
  };


  return (
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
          <h2>All accounts need a Type</h2>
        </div>
      </Fade>
    </Modal>
  );
}


