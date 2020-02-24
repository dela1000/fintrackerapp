import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import InitialItem from './InitialItem';
import { get_types } from "../Services/WebServices";
import { capitalize, decimals } from "../Services/helpers";


class Initials extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      types: [],
      view: 1,
      rows: [
         { id: 1, name: 'Wasif', age: 21, email: 'wasif@email.com' },
         { id: 2, name: 'Ali', age: 19, email: 'ali@email.com' },
         { id: 3, name: 'Saad', age: 16, email: 'saad@email.com' },
         { id: 4, name: 'Asad', age: 25, email: 'asad@email.com' }
      ],
    }
  }

  static propTypes = {
    types: PropTypes.array,
    rows: PropTypes.array,
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


  render() {
    if(this.state.view === 1){
      return (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={10}>
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
              style={{float:"right"}}
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
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={10}>
            <React.Fragment>
                <Box pt={5} pb={5}>
                  <Grid item xs={10}>
                    <Typography component="h1" variant="h6" color="inherit" align="center">
                      Add the Amount, Account Name and select the Account type below. Also, assign one Checking account as your primary account.
                    </Typography>
                  </Grid>
                </Box>
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
              >
                {this.renderTableData()}
              </Grid>
              <Box pt={10}>
                <Grid
                  container
                  spacing={0}
                >
                  <Grid item xs>
                    <Button 
                      variant="contained"
                      color="primary"
                      onClick={() => this.addNewRow()}
                    >
                      Add More
                    </Button>
                  </Grid>
                  <Grid item xs>
                    <Button 
                      variant="contained"
                      color="primary"
                      style={{float:"right"}}
                      onClick={() => this.changeView(3)}
                    >
                      Next
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </React.Fragment>
          </Grid>
        </Grid>
      )
    }
    if(this.state.view === 3){
      return (
        <React.Fragment>
          HELLO
        </React.Fragment>
      )
    }
  }
}

export default Initials;