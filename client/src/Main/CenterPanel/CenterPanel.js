import React from 'react';


import CenterHeader from './CenterHeader.js';
import ListingPanel from './ListingPanel.js';

export default function CenterPanel(props) {
  return (
    <React.Fragment>
      <CenterHeader 
        currentTimeframe={props.currentTimeframe}
        totalExpenses={props.totalExpenses}
        currentAvailable={props.currentAvailable}
      />
      <ListingPanel 
        viewSelected={props.viewSelected}
        currentTimeframe={props.currentTimeframe}
        listingDataSelected={props.listingDataSelected}
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