import React from 'react';

import CenterHeader from './CenterHeader.js';
import SelectorPanel from './SelectorPanel.js';

export default function CenterPanel({timeframe, totalExpenses, currentAvailable, listingDataSelected, listingData, message, availableByAccount, customOption}) {
  return (
    <React.Fragment>
      <CenterHeader
        timeframe={timeframe}
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
      />
    </React.Fragment>
  )
}