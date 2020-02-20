import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';


class InitialItem extends React.Component {
  
  changeView(pg){
    this.setState({view: pg})
  }

  handleAmount = event => {
    
  };

  render() {

      return (
        <React.Fragment>
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
        </React.Fragment>
      )
    }
  }
}

export default InitialItem;
