import React from 'react';
import PropTypes from "prop-types";
import _ from "lodash";
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import SidePanel from './SidePanel.js';

class Main extends React.Component {
  state = {
    sidePanel: {
      availableByAccount: {
        checking: [],
        savings: [],
        investments: [],
      },
      expensesByCategory: [],
      fundsByTypes: [],
    },
  };

  static propTypes = {
    sidePanel: PropTypes.object,
  };

  componentDidMount() {
    axios.get('/all_totals')
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({ sidePanel: data.data })
        }
      })
  }

  selectItem(item){
    console.log("+++ 67 Main.js item: ", item)
  }

  render () {
    return (
      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Paper>
            <SidePanel 
              availableByAccount={this.state.sidePanel.availableByAccount}
              selectItem={this.selectItem}
            />
          </Paper>
        </Grid>
         <Grid item xs={7}>
           <Paper>xs</Paper>
         </Grid>
         <Grid item xs={3}>
           <Paper>xs</Paper>
         </Grid>
       </Grid>
    )
  }
}

export default Main;