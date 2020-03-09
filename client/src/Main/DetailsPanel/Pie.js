import React from 'react';

import PieChart, {
  Series,
  Label,
  Connector,
  Size,
  Legend,
  SmallValuesGrouping,
} from 'devextreme-react/pie-chart';

export default function Pie({data, title, argumentField, valueField, formatLabel}) {
  return (
    <PieChart id="pie"
      palette="Bright"
      dataSource={data}
      title={title}
    >
      <Legend
        visible={false}
      />
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
    </PieChart>
  )
}