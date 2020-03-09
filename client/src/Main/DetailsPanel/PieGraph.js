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
import _ from 'lodash'


export default function Dashboard({viewSelected, graphData, availableByAccount}) {

  console.log("+++ 16 PieGraph.js viewSelected: ", viewSelected)

  let data = []
  
  let title = " this month";
  let argumentField = "";
  let valueField = "";

  if(viewSelected === "expenses"){
    data = graphData;
    argumentField = "category"
    valueField = "amount"
  }

  if(viewSelected === "funds"){
    //TO FINISH
    _.forEach(availableByAccount, account => {
      console.log("+++ 27 PieGraph.js account: ", account)
    })
    data = availableByAccount;
    argumentField = "account"
    valueField = "amount"
  }


  const formatLabel = (arg) => {
    return `${capitalize(arg.argumentText)}: ${decimals(arg.valueText)}`;
  }

  if(viewSelected){
    title = capitalize(viewSelected) + title;
  }

  return (
    <PieChart
      id="pie"
      dataSource={data}
      palette="Bright"
      title={title}
    >
      <Series
        argumentField={argumentField}
        valueField={valueField}
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
