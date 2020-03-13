import React from 'react';
import _ from 'lodash';

import PieChart, {
  Series,
  Label,
  Connector,
  Size,
  Legend,
  SmallValuesGrouping,
  Font,
} from 'devextreme-react/pie-chart';

import { capitalize, decimals } from "../../Services/helpers";
import { colors } from "../../Services/Colors";

const formatLabel = (arg) => {
  return `${capitalize(arg.argumentText)}: $${decimals(arg.valueText)}`;
}

export default function Pie({data, title, argumentField, valueField }) {
  return (
    <PieChart 
      id="pie"
      palette={colors}
      paletteExtensionMode="blend"
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
          <Font color="#353535" />
          <Connector 
            visible={true} 
            width={0.5} 
          />
        </Label>
        <SmallValuesGrouping 
          threshold={4.5} 
        />
      </Series>
      <Size width={500} />
    </PieChart>
  )
}