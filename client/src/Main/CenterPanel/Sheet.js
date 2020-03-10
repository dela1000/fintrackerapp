import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Typography from '@material-ui/core/Typography';

import { capitalize, decimals, findMissingDates } from "../../Services/helpers.js";


let type = 'expenses'

class ListingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerData: [],
      dailyData: []
    }
  }

  componentDidMount () {
    this.formatData();
  }

  componentDidUpdate (prevProps) {
    if(prevProps !== this.props){
      this.formatData();
    }
  }

  formatData = () => {
    if(this.props.listingDataSelected.type.toUpperCase().includes('expense'.toUpperCase())){
      console.log("+++ 19 Sheet.js this.props.listingData: ", this.props.listingData)
      var mainHolder = {};
      var dailyHolder = {};
      var dailyData = [];
      var headerData = [];
      var tempHeaderData =[];
      _.forEach(this.props.listingData, (item) => {
        if(!mainHolder[item.categoryId]){
          tempHeaderData.push({name: item.expensescategory.name, id: item.categoryId});
          mainHolder[item.categoryId] = item.categoryId
        }
        if(!dailyHolder[item.date]){
          dailyHolder[item.date] = {
            date: item.date,
            [item.expensescategory.name]: item.amount,
            total: item.amount
          }
        } else {
          if(!dailyHolder[item.date][item.expensescategory.name]){
            dailyHolder[item.date][item.expensescategory.name] = item.amount;
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          } else {
            dailyHolder[item.date][item.expensescategory.name] = dailyHolder[item.date][item.expensescategory.name] + item.amount;
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          }
        }
        dailyHolder[item.date][item.expensescategory.name] = Number(decimals(dailyHolder[item.date][item.expensescategory.name]))
      })
      tempHeaderData = _.orderBy(tempHeaderData, ['id'],['asc']);
      _.forEach(dailyHolder, (item) => {
        dailyData.push(item)
      })
      _.forEach(tempHeaderData, (item) => {
        headerData.push(item.name);
      })
      headerData.push("total");

      dailyData = dailyData.concat(findMissingDates(dailyData));

      dailyData = dailyData.sort((a, b) => moment(a.date) - moment(b.date))
      this.setState({type: "expenses", headerData, dailyData})
    }
    // if(this.props.listingDataSelected.type.toUpperCase().includes('fund'.toUpperCase())){
    //   console.log("+++ 32 Sheet.js AT FUNDS")
    //   console.log("+++ 32 Sheet.js this.props.listingData: ", this.props.listingData)
    //   this.setState({type: "funds"})
    // }
  }

  render(){
    const { listingData, listingDataSelected } = this.props;
    return (
      <React.Fragment>
        <TableContainer component={Paper}>
              <Table  aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                  <TableCell component="th" scope="row">
                    Date
                  </TableCell>
                  {this.state.headerData.map((item, i) => (
                    <TableCell component="th" scope="row" key={i} align="right">
                      {capitalize(item)}
                    </TableCell>
                  ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.dailyData.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell component="th" scope="row">
                        {row.date}
                      </TableCell>
                      {this.state.headerData.map((item, idx) => (
                        <TableCell component="th" scope="row" key={idx} align="right">
                          {decimals(row[item])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
      </React.Fragment>
    );
  }
}

export default ListingPanel;