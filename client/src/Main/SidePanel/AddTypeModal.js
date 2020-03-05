import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import pluralize from 'pluralize';
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
import { capitalize, decimals } from "../../Services/helpers";
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import DateFnsUtils from '@date-io/date-fns';

import { get_types, categories_bulk, user_accounts, fund_sources } from "../../Services/WebServices";

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
    width: '80vh',
    height: '70vh',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #000',
    padding: theme.spacing(8, 8, 8),
    borderRadius: '10px'
  },
  gridItem: {
    paddingLeft: theme.spacing(1),
    marginLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginRight: theme.spacing(1),
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
      itemsAdded: [],
      message: "",
      types: [],
      type: ""
    }
  }

  componentDidMount () {
    if(this.props.type === 'account'){
      get_types()
        .then((res) => {
          var data = res.data;
          if(data.success){
            this.setState({ types: data.data })
          }
        })
    }
  }

  handleOpen(value) {
    this.setState({ open: value });
    if(value === false){
      this.setState({itemsAdded: [], [this.props.type]: "", type: ""})
    }
  };

  handleChange (e) {
    this.setState({[e.target.name]: e.target.value})
  }

  onEnter (e) {
    if (e.key === 'Enter') {
      if(this.state[this.props.type]){
        this.addItem()
      }
    };
  }

  removeFromItems (i) {
    var array = [...this.state.itemsAdded];
    if (i !== -1) {
        array.splice(i, 1);
        this.setState({itemsAdded: array});
      }
  }
  
  addItem () {
    if(this.state[this.props.type]){
      if(this.props.type === 'account' && this.state.type){
        var newItem = {
          [this.props.type]: this.state[this.props.type],
          type: this.state.type
        }
        this.setState(prevState => ({
          itemsAdded: [...prevState.itemsAdded, newItem]
        }), () => {
          console.log("this.state.itemsAdded: ", JSON.stringify(this.state.itemsAdded, null, "\t"));
        })
        this.clearAfterAdd();
      }
      if(this.props.type !== 'account'){
        var newItem = {
          [this.props.type]: this.state[this.props.type],
          type: {type: "null"}
        }
        this.setState(prevState => ({
          itemsAdded: [...prevState.itemsAdded, newItem]
        }))
        this.clearAfterAdd();
      }
    }
  }

  clearAfterAdd () {
    this.setState({ [this.props.type]: "", type: "" })
  }

  submitNew () {
    if(this.state.itemsAdded.length > 0){
      var payload = []
      if(this.props.type === 'category'){
        _.forEach(this.state.itemsAdded, (item) => {
          payload.push({
            name: item.category
          })
        })
        categories_bulk(payload)
          .then((res) => {
            this.actionResponse(res)
          })
      } else if(this.props.type === 'account'){
        _.forEach(this.state.itemsAdded, (item) => {
          payload.push({
            account: item.account,
            typeId: item.type.id
          })
        })
        user_accounts(payload)
          .then((res) => {
            this.actionResponse(res)
          })
      } else if(this.props.type === 'source'){
        fund_sources(payload)
          .then((res) => {
            this.actionResponse(res)
          })
      }
    } else {
      this.setState({message: "Add at least one new " + this.props.type}, ()=> {
        console.log("+++ 129 AddTypeModal.js this.state.message: ", this.state.message)
      })
    }
  }

  actionResponse (res) {
    var data = res.data;
    if(data.success){
      this.props.getAllTotals();
      this.handleOpen(false)
    } else {
      this.setState({message: data.message})
    }
  }

  render(){
    const { classes } = this.props;
    return (
      <div>
        <Box onClick={() => this.handleOpen(true)}>
          <Grid container style={this.props.open ? {cursor: 'pointer', "marginTop": "5px", "marginLeft": "2px", "marginBottom": "2px"} : { display: 'none' }}>
            <Grid item xs={2}>
              <Box pl={3} pt={0.3} style={{cursor: 'pointer'}}>
                <LibraryAddIcon style={{fontSize: 'medium'}} />
              </Box>
            </Grid>
            <Grid item xs={8} style={this.props.open ? { display: 'block' } : { display: 'none' }}>
              <Box pl={1} style={{cursor: 'pointer'}}>
                <div>
                  add new {pluralize(this.props.type)}
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
                    <Grid container justify="center" spacing={2}>
                      <Grid item xs>
                        <TextField 
                          autoFocus
                          fullWidth
                          type="text" 
                          name={this.props.type}
                          id="outlined-basic" 
                          label={this.state.label}
                          autoComplete="off"
                          value={this.state[this.props.type]} 
                          onChange={(e) => this.handleChange(e)} 
                          onKeyPress={(e) => this.onEnter(e)}
                        />
                      </Grid>
                      <Grid  item xs style={this.props.type === 'account' ? {display: 'block'} : {display: 'none'}}>
                        <TextField
                          required
                          fullWidth
                          id="type"
                          name="type" 
                          select
                          label="Account Type"
                          onChange={(e) => this.handleChange(e)}
                          value={this.state.type || ''}
                        >
                          {this.state.types.map(src => (
                            <MenuItem key={src.id} value={src}>
                              {capitalize(src.type)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <h3 style={this.state.itemsAdded.length > 0 ? {display: 'block', marginTop: '30px'} : {display: 'none'}}> 
                      New {this.props.type} (Click to remove)
                    </h3>
                    <Grid container justify="center" spacing={2} style={this.state.itemsAdded.length > 0 ? {} : {display: 'none'}}>
                      <Grid item xs>
                        Name
                      </Grid>
                      <Grid item xs style={ this.props.type === 'account' ? {display: 'block'} : {display: 'none'}}> 
                        Type
                      </Grid>
                    </Grid>
                    <List style={{overflow: 'auto', maxHeight: '38vh'}}>
                      {this.state.itemsAdded.map((item, i) => (
                        <ListItem button key={i} onClick={() => this.removeFromItems(i)}>
                          <Grid container justify="center" spacing={2}>
                            <Grid item xs>
                              {item[this.props.type]}
                            </Grid>
                            <Grid item xs style={ this.props.type === 'account' ? {} : {display: 'none'}}> 
                              {capitalize(item.type.type)}
                            </Grid>
                          </Grid>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box pl={1} pb={1}>
                    <div className={classes.root}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => this.addItem()}
                      >
                        Add More
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => this.submitNew()}
                      >
                        Send
                      </Button>
                    </div>
                  </Box> 
                </Grid>
                <Grid item xs={4} className={classes.gridItem}>
                  <Box style={{height: '54vh'}}>
                    <h2>Current {pluralize(this.props.type)}</h2>
                    <List style={{overflow: 'auto', maxHeight: '50vh'}}>
                      {this.props.currentItems.map((item, key) => (
                        <ListItem key={key}>
                          <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                          >
                            <Grid item>
                              {capitalize(item[this.props.itemName])}
                            </Grid>
                          </Grid>
                        </ListItem>
                      ))}
                    </List>
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
