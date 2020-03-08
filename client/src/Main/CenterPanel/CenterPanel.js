import React from 'react';

// import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';

// import { decimals } from "../../Services/helpers";

import CenterHeader from './CenterHeader.js';
// import ListingData from './ListingData.js';

export default function CenterPanel(props) {
  return (
    <React.Fragment>
      <CenterHeader 
        currentTimeframe={props.currentTimeframe}
        totalExpenses={props.totalExpenses}
        currentAvailable={props.currentAvailable}
      />
    </React.Fragment>
  )
}


      // <Grid container spacing={3}>
      //   <Grid item xs={12}>
      //     <Paper className={classes.paper}>
      //       <ListingData 
      //         viewSelected={props.viewSelected}
      //         listingData={props.tableData}
      //         timeframe={props.timeframe}
      //         selectCategory={props.selectCategory}
      //         selectAccount={props.selectAccount}
      //       />
      //     </Paper>
      //   </Grid>
      // </Grid>