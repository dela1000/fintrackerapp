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

class DetailsPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PieChart
        id="pie"
        dataSource={this.props.expensesData}
        palette="Bright"
        title="Expenses this month"
      >
        <Series
          argumentField="category"
          valueField="amount"
        >
          <Label visible={true} customizeText={this.formatLabel}>
            <Connector visible={true} width={0.5} />
          </Label>
          <SmallValuesGrouping threshold={4.5} mode="smallValueThreshold" />
        </Series>

        <Size width={500} />
        <Legend visible={false} />
      </PieChart>
    );
  }

  formatLabel(arg) {
    return `${arg.argumentText}: ${decimals(arg.valueText)}`;
  }
}

export default DetailsPanel;
