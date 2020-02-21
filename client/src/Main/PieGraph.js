import React from 'react';

import PieChart, {
  Series,
  Label,
  Connector,
  Size,
  Legend,
  SmallValuesGrouping,
} from 'devextreme-react/pie-chart';
import { capitalize, decimals } from "../Services/helpers";


const formatLabel = (arg) => {
  return `${capitalize(arg.argumentText)}: ${decimals(arg.valueText)}`;
}

export default function Dashboard({viewSelected, graphData}) {

  let title = " this month";
  if(viewSelected){
    title = capitalize(viewSelected) + title;
  }

  return (
    <PieChart
      id="pie"
      dataSource={graphData}
      palette="Bright"
      title={title}
    >
      <Series
        argumentField="category"
        valueField="amount"
      >
        <Label visible={true} customizeText={formatLabel}>
          <Connector visible={true} width={0.5} />
        </Label>
        <SmallValuesGrouping threshold={4.5} mode="smallValueThreshold" />
      </Series>

      <Size width={500} />
      <Legend visible={false} />
    </PieChart>
    );
}
