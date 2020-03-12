import React from 'react';
import _ from 'lodash';

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

export default function Pie({data, title, argumentField, valueField, colors}) {
  return (
    <PieChart id="pie"
      palette="Bright"
      dataSource={data}
      title={title}
      resolveLabelOverlapping="shift"
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