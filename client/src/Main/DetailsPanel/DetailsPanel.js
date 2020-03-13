import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import { decimals } from "../../Services/helpers";

import Pie from './Pie.js'
import StackedBar from './StackedBar.js'

export default function DetailedPanel({viewSelected, graphData, timeframe, customOption, colors}) {
  // Expenses and funds data
  let mainData = [];
  let title = "";
  let sourceTitle = "";

  if(timeframe === "custom"){
    title = " - " + customOption;
    sourceTitle = " - " + customOption;
  } else {
    title = " this " + timeframe;
    sourceTitle = "Sources this " + timeframe;
  }

  // Sources Data
  let sourceData = [];
  let argumentField = "";
  
  // Daily data
  let dailyData = [];
  let tempCategoryData = [];
  let categoryData = [];
  
  if(viewSelected){
    if(viewSelected.type.toUpperCase().includes('expense'.toUpperCase())){
      title = "Expenses" + title;
    }
    if(viewSelected.type.toUpperCase().includes('fund'.toUpperCase())){
      title = "Funds" + title;
    }
  }
  
  var mainHolder = {};
  var sourceHolder = {};
  var dailyHolder = {};
  if(viewSelected.type.toUpperCase().includes('expense'.toUpperCase())){
    argumentField = "category";
    _.forEach(graphData, (item) => {
      if(!mainHolder[item.categoryId]){
        tempCategoryData.push({name: item.expensescategory.name, id: item.categoryId});
        mainHolder[item.categoryId] = {
          amount: item.amount,
          category: item.expensescategory.name
        }
      } else {
        mainHolder[item.categoryId].amount = mainHolder[item.categoryId].amount + item.amount;
      }
      if(!dailyHolder[item.date]){
        dailyHolder[item.date] = {
          date: item.date,
          [item.expensescategory.name]: item.amount
        }
      } else {
        if(!dailyHolder[item.date][item.expensescategory.name]){
          dailyHolder[item.date][item.expensescategory.name] = item.amount;
        } else {
          dailyHolder[item.date][item.expensescategory.name] = dailyHolder[item.date][item.expensescategory.name] + item.amount;
        }
      }
      dailyHolder[item.date][item.expensescategory.name] = Number(decimals(dailyHolder[item.date][item.expensescategory.name]))

    })
    _.forEach(dailyHolder, (item) => {
      dailyData.push(item)
    })
    dailyData = dailyData.sort((a, b) => moment(a.date) - moment(b.date))
  }
  
  tempCategoryData = _.orderBy(tempCategoryData, ['id'],['asc']);
  
  _.forEach(tempCategoryData, (item) => {
    categoryData.push({name: item.name, categoryId: item.id});
  })

  if(viewSelected.type.toUpperCase().includes('fund'.toUpperCase())){
    argumentField = "account";
    _.forEach(graphData, (item) => {
      if(!mainHolder[item.accountId]){
        mainHolder[item.accountId] = {
          amount: item.amount,
          account: item.useraccount.account
        }
      } else {
        mainHolder[item.accountId].amount = mainHolder[item.accountId].amount + item.amount;
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
  
  mainHolder = _.orderBy(mainHolder, ['id'],['asc']);
  _.forEach(mainHolder, (item) => {
    mainData.push(item)
  })
  console.log("+++ 116 DetailsPanel.js mainData: ", mainData)

  if(viewSelected.type.toUpperCase().includes('expense'.toUpperCase())){
    if(viewSelected.categoryId){
      return (
        <React.Fragment>
          <StackedBar 
            argumentField="date"
            categoryData={categoryData}
            dailyData={dailyData}
            viewSelected={viewSelected}
            colors={colors}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Pie
            data={mainData}
            title={title}
            argumentField={argumentField}
            colors={colors}
          />
          <Divider />
          <StackedBar 
            argumentField="date"
            categoryData={categoryData}
            dailyData={dailyData}
            viewSelected={viewSelected}
            colors={colors}
          />
        </React.Fragment>
      );
    }
  }

  if(viewSelected.type.toUpperCase().includes('funds'.toUpperCase())){
    return (
      <React.Fragment>
        <Pie
          data={mainData}
          title={title}
          argumentField={argumentField}
        />
        <Divider />
        <Pie
          data={sourceData}
          title={sourceTitle}
          argumentField={argumentField}
        />
      </React.Fragment>
    );
  }
}


