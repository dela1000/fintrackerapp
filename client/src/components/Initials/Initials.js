import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { get_types } from "../Services/WebServices";


class Initials extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      types: []
    }
  }

  static propTypes = {
    types: PropTypes.array,
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

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs>
          <Typography component="h1" variant="h6" color="inherit">
            Welcome to FinTracker!
          </Typography>
          <Typography component="h2" variant="h6" color="inherit">
            Here, we will add all the initial amounts for our current bank, savings, and investment accounts.
          </Typography>
        </Grid>
      </Grid>
    )
  }
}

export default Initials;