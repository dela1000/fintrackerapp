import React from 'react';

import { Chart, 
  Series, 
  CommonSeriesSettings, 
  Legend, 
  ValueAxis, 
  Title, 
  Tooltip 
} from 'devextreme-react/chart';

import { capitalize, decimals } from "../../Services/helpers";

const customizeTooltip = arg => {
    return {
      text: `${capitalize(arg.seriesName) }: $${decimals(arg.valueText)}`
    };
  }

export default function Stacked ({dailyData, categoryData}) {
  return (
    <Chart
      id="chart"
      title="Expenses By Day"
      dataSource={dailyData}
    >
      <CommonSeriesSettings argumentField="date" type="stackedBar" />
      {categoryData.map((item, i) => (
        <Series
          key={i}
          name={capitalize(item)}
          valueField={item}
        />
      ))}
      <ValueAxis position="right">
        <Title text="$" />
      </ValueAxis>
      <Legend
        verticalAlignment="bottom"
        horizontalAlignment="center"
        itemTextPosition="top"
      />
      <Tooltip
        enabled={true}
        location="edge"
        customizeTooltip={customizeTooltip}
      />
    </Chart>
  );
}
  

