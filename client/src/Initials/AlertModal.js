import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

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

  if(props.errorFound) {
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
          <h2>{props.failMessage}</h2>
        </div>
      </Fade>
    </Modal>
  );
}


