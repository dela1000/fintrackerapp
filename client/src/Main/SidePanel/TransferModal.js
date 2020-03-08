import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import ImportExportIcon from '@material-ui/icons/ImportExport';

import { to2Fixed } from "../../Services/helpers";

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