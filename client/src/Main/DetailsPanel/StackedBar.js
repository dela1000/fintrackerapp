import React from 'react';

import { Chart, 
  Series, 
  CommonSeriesSettings, 
  Legend, 
  ValueAxis, 
  Title, 
  Tooltip,
  AdaptiveLayout
} from 'devextreme-react/chart';

import { capitalize, decimals } from "../../Services/helpers";

const customizeTooltip = arg => {
    return { text: `${capitalize(arg.seriesName) }: $${decimals(arg.valueText)}` };
  }

const setTitle = (data) => {
  if(data.type === 'expenses'){
    if(!data.name){
      return capitalize(data.type) + " by Day"
    } else {
      return "Category " + capitalize(data.name) + " by Day"
    }
  }
}

export default function Stacked ({dailyData, categoryData, viewSelected, argumentField}) {
  return (
    <Chart
      id="chart"
      title={setTitle(viewSelected)}
      dataSource={dailyData}
    >
      <CommonSeriesSettings argumentField={argumentField} type="stackedBar" />
      {categoryData.map((item, i) => (
        <Series
          key={i}
          name={capitalize(item)}
          valueField={item}
        />
      ))}
      <ValueAxis position="left">
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
  
