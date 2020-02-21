import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { get_types } from "../Services/WebServices";


class Initials extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      types: [],
      view: 1
    }
  }

  static propTypes = {
    types: PropTypes.array,
    view: PropTypes.number
  };

  componentDidMount() {
    this.getTypes();
  };

  getTypes (){
    get_types()
      .then((res) => {
        var data = res.data;
        if(data.success){
          console.log("+++ 29 Initials.js data.data: ", data.data)
          this.setState({ types: data.data })
        }
      })
  }
  changeView(pg){
    this.setState({view: pg})
  }

  handleAmount = event => {
    
  };

  render() {
    if(this.state.view === 1){
      return (
        <Grid container spacing={1}>
          <Grid item lg>
            <Typography component="h1" variant="h4" color="inherit">
              Welcome to FinTracker!
            </Typography>
            <Typography component="h2" variant="h6" color="inherit">
              Here, we will add all the initial amounts for our current Checking, Savings, and Investment accounts.
            </Typography>
            <br/>
            <Button
              variant="contained"
              color="primary"
              endIcon={<Icon>send</Icon>}
              onClick={() => this.changeView(2)}
            >
              Next
            </Button>
          </Grid>
        </Grid>
      )
    }
    if(this.state.view === 2){
      return (
        <React.Fragment>
          <Grid container spacing={1}>
            <Grid item xs>
              <Typography component="h1" variant="h6" color="inherit">
                Add the Amount, Account Name and select the Account type below. Also, assign one Checking account as your primary account.
              </Typography>
              
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            spacing={8}
          >
            <Grid item xs>
              <TextField 
                fullWidth
                type="number" 
                name="amount" 
                id="outlined-basic" 
                label="Amount" 
                autoComplete="off"
                onChange={this.handleAmount}
                value={this.amount}
              />
            </Grid>
            <Grid item xs>
              xs
            </Grid>
            <Grid item xs>
              xs
            </Grid>
            <Grid item xs>
              xs
            </Grid>
          </Grid>
        </React.Fragment>
      )
    }
  }
}

export default Initials;