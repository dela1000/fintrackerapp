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
  constructor() {
    super();
    this.state = {
      types: [],
      view: 1,
      rows: [
        { 
          amount: 0,
          name: "",
          type: ''
        },
      ]
    };
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
          this.setState({ types: data.data })
        }
      })
  }

  changeView(pg){
    this.setState({view: pg})
  }


  handleChange = idx => evt => {
    console.log("+++ 54 Initials.js evt.target.name: ", evt.target.name)
    const newShareholders = this.state.rows.map((row, sidx) => {
      if (idx !== sidx) return row;
      return { ...row, [evt.target.name]: evt.target.value };
    });

    this.setState({ rows: newShareholders });
  };


  handleAddRow = () => {
    this.setState({
      rows: this.state.rows.concat([{ 
          amount: 0,
          name: "",
          type: ''
        }])
    });
  };

  handleRemoveRow = idx => () => {
    this.setState({
      rows: this.state.rows.filter((s, sidx) => idx !== sidx)
    });
  };

  handleSubmit = evt => {
    evt.preventDefault();
    console.log("this.state.rows: ", JSON.stringify(this.state.rows, null, "\t"));
  };

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
            <form onSubmit={this.handleSubmit}>
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
                    {this.state.rows.map((item, index) => (
                      <InitialItem 
                        key={index} 
                        item={item} 
                        index={index} 
                        handleChange={this.handleChange} 
                        handleRemoveRow={this.handleRemoveRow} 
                        types={this.state.types}
                      />
                    ))}
                  </Grid>
                  <button
                    type="button"
                    onClick={this.handleAddRow}
                  >
                    Add Row
                  </button>
                  <button>Next</button>
              </React.Fragment>
            </form>
          </Grid>
        </Grid>
      );
    }
  }
}

export default Initials;