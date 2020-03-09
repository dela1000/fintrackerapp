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

const dataSource = [{
  state: 'Germany',
  young: 6.7,
  middle: 28.6,
  older: 5.1
}, {
  state: 'Japan',
  young: 9.6,
  middle: 43.4,
  older: 9
}, {
  state: 'Russia',
  young: 13.5,
  middle: 49,
  older: 5.8
}, {
  state: 'USA',
  young: 30,
  middle: 90.3,
  older: 14.5
}];

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
  

