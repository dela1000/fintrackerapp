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
  return `${capitalize(arg.argumentText)}<br>$${decimals(arg.valueText)}`;
}

class Pie extends React.Component {

  constructor(props) {
    super(props);
    this.pointClickHandler = this.pointClickHandler.bind(this);
    this.legendClickHandler = this.legendClickHandler.bind(this);
  }

  render(){
    const { data, title, argumentField, colors } = this.props;
    const customizePoint = (arg) => {
      if(arg.data && arg.data.id && arg.data.category && !_.isEmpty(colors)){
        return { color: colors[arg.data.id].color, hoverStyle: { color: colors[arg.data.id].color } };
      }
    }
    // Remove Initials from pie chart
    if(argumentField === 'account')
    _.forEach(data, (item, i) => {
      if(item && item.account === "Initial"){
        data.splice(i, 1);
      }
    })
    return (
      <PieChart 
        id="pie"
        paletteExtensionMode="blend"
        dataSource={data}
        title={title}
        resolveLabelOverlapping="shift"
        customizePoint={customizePoint}
        onPointClick={this.pointClickHandler}
        onLegendClick={this.legendClickHandler}
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
        <Legend visible={true}/>
        <Size width={500} />
      </PieChart>
    )
  }

  pointClickHandler(e) {
    this.toggleVisibility(e.target);
  }

  legendClickHandler(e) {
    let arg = e.target;
    let item = e.component.getAllSeries()[0].getPointsByArg(arg)[0];
    this.toggleVisibility(item);
  }

  toggleVisibility(item) {
  item.isVisible() ? item.hide() : item.show();
  }
}

export default Pie;