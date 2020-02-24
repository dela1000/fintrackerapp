import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    padding: theme.spacing(10, 10, 10),
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
      timeout: 750,
      }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <Typography 
            component="h1" 
            variant="h6" 
            color="inherit" 
            align="center"
          >
            {props.failMessage} 
          </Typography>
        </div>
      </Fade>
    </Modal>
  );
}


