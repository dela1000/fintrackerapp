import React from 'react';

import CenterHeader from './CenterHeader.js';
import SelectorPanel from './SelectorPanel.js';

export default function CenterPanel({
    timeframe, 
    totalAmountFound,
    totalExpenses, 
    currentAvailable, 
    listingDataSelected, 
    listingData, 
    message, 
    availableByAccount, 
    customOption, 
    openDetailsDrawer,
    userAccounts,
    colors,
    sortListingData,
  }) {
  return (
    <React.Fragment>
      <CenterHeader
        timeframe={timeframe}
        totalAmountFound={totalAmountFound}
        totalExpenses={totalExpenses}
        currentAvailable={currentAvailable}
        customOption={customOption}
        availableByAccount={availableByAccount}
        listingDataSelected={listingDataSelected}
      />
      <SelectorPanel
        listingDataSelected={listingDataSelected}
        listingData={listingData}
        message={message}
        openDetailsDrawer={openDetailsDrawer}
        userAccounts={userAccounts}
        colors={colors}
        sortListingData={sortListingData}
      />
    </React.Fragment>
  )
}