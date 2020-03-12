import React from 'react';

import CenterHeader from './CenterHeader.js';
import SelectorPanel from './SelectorPanel.js';

export default function CenterPanel({timeframe, totalExpenses, currentAvailable, listingDataSelected, listingData, message }) {
  return (
    <React.Fragment>
      <CenterHeader
        timeframe={timeframe}
        totalExpenses={totalExpenses}
        currentAvailable={currentAvailable}
      />
    </React.Fragment>
  )
}
      // <SelectorPanel
      //   listingDataSelected={listingDataSelected}
      //   listingData={listingData}
      //   message={message}
      // />