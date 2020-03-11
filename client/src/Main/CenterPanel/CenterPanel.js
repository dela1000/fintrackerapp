import React from 'react';

import CenterHeader from './CenterHeader.js';
import SelectorPanel from './SelectorPanel.js';

export default function CenterPanel({currentTimeframe, totalExpenses, currentAvailable, listingDataSelected, listingData, message }) {
  return (
    <React.Fragment>
      <CenterHeader
        currentTimeframe={currentTimeframe}
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