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
import Tooltip from '@material-ui/core/Tooltip';
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
            [item.expensescategory.name]: {
              total: item.amount,
              comment: ["$" + decimals(item.amount) + " " + item.comment]
            },
            total: item.amount,
          }
        } else {
          if(!dailyHolder[item.date][item.expensescategory.name]){
            dailyHolder[item.date][item.expensescategory.name] = {
              total: item.amount,
              comment: ["$" + decimals(item.amount) + " " + item.comment]
            }
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          } else {
            dailyHolder[item.date][item.expensescategory.name].total = dailyHolder[item.date][item.expensescategory.name].total + item.amount;
            dailyHolder[item.date][item.expensescategory.name].comment.push("$" + decimals(item.amount) + " " + item.comment);
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          }
        }
        dailyHolder[item.date][item.expensescategory.name].total = decimals(dailyHolder[item.date][item.expensescategory.name].total);
      })
      
      tempHeaderData = _.orderBy(tempHeaderData, ['id'],['asc']);
      _.forEach(dailyHolder, (item) => {
        dailyData.push(item)
      })
      _.forEach(tempHeaderData, (item) => {
        headerData.push(item.name);
      })

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

  renderTableData() {
    return this.state.dailyData.map((row, i) => {
      return (
          <TableRow key={i} hover>
            <TableCell component="th" scope="row">
              {row.date}
            </TableCell>
            {this.subTable(row)}
            <TableCell component="th" scope="row"  align="right">
              {decimals(row.total)}
            </TableCell>
        </TableRow>
      )
    })
  }

  subTable(row){
    return this.state.headerData.map((item, idx) => {
      if(row[item]){
        if(row[item].comment){
          return (
            <Tooltip key={idx} 
              style={{whiteSpace: 'pre-line'}}
              title={
                <React.Fragment>
                  {row[item].comment.map((comment, i) => {
                    return (
                      <Typography key={i}>
                        {comment}
                      </Typography>
                    )
                  })}
                </React.Fragment>
              }
            >
              <TableCell key={idx} component="th" scope="row"  align="right">
                {row[item].total}
              </TableCell>
            </Tooltip>
          )
        } else {
          return (
            <TableCell key={idx} component="th" scope="row"  align="right">
              {row[item].total}
            </TableCell>
          )
        }
      } else {
        return (
          <TableCell key={idx} component="th" scope="row"  align="right">
          </TableCell>
        )
      }
      
    })
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
                  <TableCell component="th" scope="row" align="right">
                    Total
                  </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.renderTableData()}
                </TableBody>
              </Table>
            </TableContainer>
      </React.Fragment>
    );
  }
}

export default ListingPanel;