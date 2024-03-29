import React from 'react';
import _ from 'lodash';

import { 
  Chart, 
  Series, 
  CommonSeriesSettings, 
  Legend, 
  ValueAxis, 
  Title, 
  Tooltip,
} from 'devextreme-react/chart';

import { capitalize, decimals } from "../../Services/helpers";


export default function Stacked ({dailyData, categoryData, viewSelected, argumentField, colors}) {
  
  const setTitle = (data) => {
    if(data.type === 'expenses'){
      if(!data.name){
        return capitalize(data.type) + " by Day"
      } else {
        return "Category " + capitalize(data.name) + " by Day"
      }
    }
  }

  const customizeTooltip = arg => {
    if(viewSelected.categoryId){
      return { text: `${capitalize(arg.seriesName) }<br>$${decimals(arg.valueText)}` };
    } else {
      return { text: `${capitalize(arg.seriesName) }<br>$${decimals(arg.valueText)}<br>Day Total:<br>${decimals(arg.totalText)}` };
    }
  }

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
          name={capitalize(item.name)}
          valueField={item.name}
          color={!_.isEmpty(colors) ? colors[item.categoryId].color : null}
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
        cornerRadius="10"
        customizeTooltip={customizeTooltip}
      />
      
    </Chart>
  );
}
  

