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

const formatLabel = (arg) => {
  return `${capitalize(arg.argumentText)}: $${decimals(arg.valueText)}`;
}

let customPalette = ["#F8CBAD","#F4B084","#FFD966","#BDD7EE","#9BC2E6","#FCE4D6","#F8CBAD","#B58AC8","#D0CECE","#AEAAAA","#FFE699","#11A4A3","#FFC54D","#0294A5","#A79C93","#C1403D","#6C6B74","#2E30E3","#9199BE","#54678F","#212624","#594346","#212027","#F22F08","#8D2F23","#561E18","#1B1924","#B5C1B4","#DCD9C6","#74593D","#3F3232","#EB2D26","#0A4D78"];

export default function Pie({data, title, argumentField, valueField, colors}) {
  return (
    <PieChart 
      id="pie"
      palette={customPalette}
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
          <Font color="#767676" />
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