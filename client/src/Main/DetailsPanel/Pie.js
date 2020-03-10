import React from 'react';

import PieChart, {
  Series,
  Label,
  Connector,
  Size,
  Legend,
  SmallValuesGrouping,
} from 'devextreme-react/pie-chart';

import { capitalize, decimals } from "../../Services/helpers";

const formatLabel = (arg) => {
  return `${capitalize(arg.argumentText)}: $${decimals(arg.valueText)}`;
}

var chartOptions = {
    palette: ['black','red','white', '#7CBAB4', '#92C7E2', '#75B5D6', '#B78C9B', '#F2CA84', '#A7CA74'],
    //...   
};

export default function Pie({data, title, argumentField, valueField}) {
  return (
    <PieChart id="pie"
      palette="Bright"
      dataSource={data}
      title={title}
      resolveLabelOverlapping="shift"
      chartOptions={chartOptions}
    >
      <Legend visible={false} />
      <Series
        argumentField={argumentField}
        valueField="amount"
      >
        <Label 
          visible={true} 
          customizeText={formatLabel}
        >
          <Connector 
            visible={true} 
            width={0.5} 
          />
        </Label>
        <SmallValuesGrouping 
          threshold={4.5} 
          mode="smallValueThreshold" 
        />
      </Series>
      <Size width={500} />
    </PieChart>
  )
}