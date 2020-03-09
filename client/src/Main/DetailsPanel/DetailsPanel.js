import React from 'react';
import _ from 'lodash';

import PieChart, {
  Series,
  Label,
  Connector,
  Size,
  Legend,
  SmallValuesGrouping,
  Export,
  Font,
} from 'devextreme-react/pie-chart';
import Divider from '@material-ui/core/Divider';

import { capitalize, decimals } from "../../Services/helpers";

import Pie from './Pie.js'

export default function DetailedPanel({viewSelected, graphData, currentTimeframe}) {
  console.log("+++ 16 PieGraph.js viewSelected: ", viewSelected)
  let data = [];
  let sourceData = [];
  
  let title = " this " + currentTimeframe;
  let sourceTitle = "Sources this " + currentTimeframe;
  let argumentField = "";
  let valueField = "";
  
  if(viewSelected){
    if(viewSelected.type.toUpperCase().includes('expense'.toUpperCase())){
      title = "Expenses" + title;
    }
    if(viewSelected.type.toUpperCase().includes('fund'.toUpperCase())){
      title = "Funds" + title;
    }
  }
  
  var tempHolder = {};
  var sourceHolder = {};
  if(viewSelected.type.toUpperCase().includes('expense'.toUpperCase())){
    argumentField = "category";
    valueField = "amount";
    _.forEach(graphData, (item) => {
      if(!tempHolder[item.categoryId]){
        tempHolder[item.categoryId] = {
          amount: item.amount,
          category: item.expensescategory.name
        }
      } else {
        tempHolder[item.categoryId].amount = tempHolder[item.categoryId].amount + item.amount;
      }
    })
  }

  if(viewSelected.type.toUpperCase().includes('fund'.toUpperCase())){
    argumentField = "account";
    valueField = "amount";
    _.forEach(graphData, (item) => {
      if(!tempHolder[item.accountId]){
        tempHolder[item.accountId] = {
          amount: item.amount,
          account: item.useraccount.account
        }
      } else {
        tempHolder[item.accountId].amount = tempHolder[item.accountId].amount + item.amount;
      }
      if(!sourceHolder[item.sourceId]){
        sourceHolder[item.sourceId] = {
          amount: item.amount,
          account: item.fundsource.source
        }
      } else {
        sourceHolder[item.sourceId].amount = sourceHolder[item.sourceId].amount + item.amount;
      }
    })
    _.forEach(sourceHolder, (item) =>{
      sourceData.push(item)
    })
  }

  _.forEach(tempHolder, (item) => {
    data.push(item)
  })

  const formatLabel = (arg) => {
    return `${capitalize(arg.argumentText)}: ${decimals(arg.valueText)}`;
  }
  if(viewSelected.type.toUpperCase().includes('expense'.toUpperCase())){
    return (
      <Pie
        data={data}
        title={title}
        argumentField={argumentField}
        valueField={valueField}
        formatLabel={formatLabel}
      />
    );
  }

  if(viewSelected.type.toUpperCase().includes('funds'.toUpperCase())){
    return (
      <React.Fragment>
        <Pie
          data={data}
          title={title}
          argumentField={argumentField}
          valueField={valueField}
          formatLabel={formatLabel}
        />
        <Divider />
        <Pie
          data={sourceData}
          title={sourceTitle}
          argumentField={argumentField}
          valueField={valueField}
          formatLabel={formatLabel}
        />
      </React.Fragment>
    );
  }
}


