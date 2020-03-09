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
        listingData={props.listingData}
        message={props.message}
      />
    </React.Fragment>
  )
}