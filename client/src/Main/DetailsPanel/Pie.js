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

class Pie extends React.Component {

  render(){
    const { data, title, argumentField, colors } = this.props;
    const customizePoint = (arg) => {
      if(arg.data && arg.data.id && arg.data.category && !_.isEmpty(colors)){
        return { color: colors[arg.data.id].color, hoverStyle: { color: colors[arg.data.id].color } };
      }
    }
    return (
      <PieChart 
        id="pie"
        paletteExtensionMode="blend"
        dataSource={data}
        title={title}
        resolveLabelOverlapping="shift"
        customizePoint={customizePoint}
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
}

export default Pie;