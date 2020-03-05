import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import pluralize from 'pluralize';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { capitalize, decimals } from "../../Services/helpers";
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
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
    width: '100vh',
    height: '70vh',
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

class AddTypeModal extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      classes: {},
      open: false,
      label: "New " + this.props.type,
      [this.props.type]: "",
      itemsAdded: []
    }
  }


  handleOpen(value) {
    this.setState({ open: value });
  };

  handleChange (e) {
    this.setState({[e.target.name]: e.target.value}, () => {
      console.log("this.state: ", JSON.stringify(this.state, null, "\t"));
    })
  }
  
  addMore () {
    if(this.state[this.props.type]){
      var newItem = {
        [this.props.type]: this.state[this.props.type],
      }
      this.setState(prevState => ({
        itemsAdded: [...prevState.itemsAdded, newItem]
      }), () => {
        console.log("+++ 86 AddTypeModal.js this.state.itemsAdded: ", this.state.itemsAdded)
      })
      this.clearAfterSubmit();
    }
  }

  clearAfterSubmit () {
    this.setState({ [this.props.type]: "" })
  }

  render(){
    const { classes } = this.props;
    return (
      <div>
        <Box  onClick={() => this.handleOpen(true)}>
          <Grid container style={this.props.open ? {cursor: 'pointer', "marginTop": "5px", "marginLeft": "2px", "marginBottom": "2px"} : { display: 'none' }}>
            <Grid item xs={2}>
              <Box pl={3} pt={0.3} style={{cursor: 'pointer'}}>
                <LibraryAddIcon style={{fontSize: 'medium'}}  />
              </Box>
            </Grid>
            <Grid item xs={8} style={this.props.open ? { display: 'block' } : { display: 'none' }}>
              <Box pl={1} style={{cursor: 'pointer'}}>
                <div>
                  New {pluralize(this.props.type)}
                </div>
              </Box>
            </Grid>
          </Grid>
        </Box>
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
            <div className={classes.paper}>
              <Grid container justify="space-around">
                <Grid item xs className={classes.gridItem}>
                  <h2>Add {this.props.type}</h2>
                  <Box style={{height: '50vh'}}>
                    <TextField 
                      fullWidth
                      type="text" 
                      name={this.props.type}
                      id="outlined-basic" 
                      label={this.state.label}
                      autoComplete="off"
                      value={this.state[this.props.type]} 
                      onChange={(e) => this.handleChange(e)} 
                    />
                    <h2 style={this.state.itemsAdded.length > 0 ? {display: 'block'} : {display: 'none'}}>New {this.props.type}</h2>
                    {this.state.itemsAdded.map((item, key) => (
                      <ListItem button key={key}>
                        <Grid
                          container
                          direction="row"
                          justify="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            {item[this.props.type]}
                          </Grid>
                        </Grid>
                      </ListItem>
                    ))}
                  </Box>
                  <Box pl={1} pb={1}>
                    <div className={classes.root}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => this.addMore()}
                      >
                        Add More
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        // onClick={submitNew}
                      >
                        Send
                      </Button>
                    </div>
                  </Box> 
                </Grid>
                <Grid item xs className={classes.gridItem}>
                  <Box style={{height: '54vh'}}>
                    <h2>Current {pluralize(this.props.type)}</h2>
                    {this.props.currentItems.map((item, key) => (
                      <div button key={key}>
                        <Grid
                          container
                          direction="row"
                          justify="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            {capitalize(item[this.props.name])}
                          </Grid>
                        </Grid>
                      </div>
                    ))}
                  </Box>
                  <h3>Current {pluralize(this.props.type)}: {this.props.currentItems.length} </h3>
                </Grid>
              </Grid>
            </div>
          </Fade>
        </Modal>
      </div>
    );
  }
}

AddTypeModal.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddTypeModal);
