import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import { capitalize, decimals, findMissingDates, dateFormat } from "../../Services/helpers.js";


const styles = theme => ({
  tableCell: {
    fontSize: '12px'
  }
})

class Sheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      today: "",
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
    let today = moment().format(dateFormat);
    this.setState({today})
    
    let mainHolder = {};
    let dailyHolder = {};
    let dailyData = [];
    let headerData = [];
    let tempHeaderData =[];
    
    // EXPENSES SECTION
    if(this.props.listingDataSelected.type.toUpperCase().includes('expense'.toUpperCase())){
      _.forEach(this.props.listingData, (item) => {
        if(!mainHolder[item.categoryId] && !_.isEmpty(this.props.colors)){
          tempHeaderData.push({name: item.expensescategory.name, id: item.categoryId, color: this.props.colors[item.categoryId].color});
          mainHolder[item.categoryId] = item.categoryId;
        }
        if(!dailyHolder[item.date]){
          dailyHolder[item.date] = {
            date: item.date,
            [item.categoryId]: {
              total: item.amount,
              comment: ["$" + decimals(item.amount) + " " + item.comment]
            },
            total: item.amount,
          }
        } else {
          if(!dailyHolder[item.date][item.categoryId]){
            dailyHolder[item.date][item.categoryId] = {
              total: item.amount,
              comment: ["$" + decimals(item.amount) + " " + item.comment]
            }
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          } else {
            dailyHolder[item.date][item.categoryId].total = dailyHolder[item.date][item.categoryId].total + item.amount;
            dailyHolder[item.date][item.categoryId].comment.push("$" + decimals(item.amount) + " " + item.comment);
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          }
        }
        dailyHolder[item.date][item.categoryId].total = decimals(dailyHolder[item.date][item.categoryId].total);
      })
    }
    // FUNDS SECTION
    if(this.props.listingDataSelected.type.toUpperCase().includes('fund'.toUpperCase())){
      console.log("+++ 32 Sheet.js AT FUNDS")
      _.forEach(this.props.listingData, (item) => {
        if(!mainHolder[item.accountId]){
          tempHeaderData.push({name: item.account, type: item.type , id: item.accountId});
          mainHolder[item.accountId] = item.accountId
        }
        if(!dailyHolder[item.date]){
          dailyHolder[item.date] = {
            date: item.date,
            [item.accountId]: {
              total: item.amount,
              comment: ["$" + decimals(item.amount) + " - Source: " + capitalize(item.source)]
            },
            total: item.amount,
          }
          if(item.comment && item.comment.length > 0){
            dailyHolder[item.date][item.accountId].comment[0] = dailyHolder[item.date][item.accountId].comment[0] + " - Comment: " + item.comment;
          }
        } else {
          if(!dailyHolder[item.date][item.accountId]){
            dailyHolder[item.date][item.accountId] = {
              total: item.amount,
              comment: ["$" + decimals(item.amount) + " - Source: " + capitalize(item.source)]
            }
            if(item.comment && item.comment.length > 0){
              dailyHolder[item.date][item.accountId].comment[0] = dailyHolder[item.date][item.accountId].comment[0] + " - Comment: " + item.comment;
            }
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          } else {
            dailyHolder[item.date][item.accountId].total = dailyHolder[item.date][item.accountId].total + item.amount;
            dailyHolder[item.date][item.accountId].comment.push("$" + decimals(item.amount) + " " + item.comment);
            dailyHolder[item.date].total = dailyHolder[item.date].total + item.amount;
          }
          dailyHolder[item.date][item.accountId].total = decimals(dailyHolder[item.date][item.accountId].total);
        }
      })
    }
    // CREATE ARRAYS
    tempHeaderData = _.orderBy(tempHeaderData, ['id'],['asc']);
    _.forEach(tempHeaderData, (item) => {
      headerData.push({name: item.name, type: item.type, id: item.id, color: item.color || null});
    })

    _.forEach(dailyHolder, (item) => {
      dailyData.push(item)
    })

    dailyData = dailyData.concat(findMissingDates(dailyData));
    dailyData = dailyData.sort((a, b) => moment(a.date) - moment(b.date))
    this.setState({type: "funds", headerData, dailyData})
  }

  renderHeaders() {
    return (
      <TableRow>
        <TableCell component="th" scope="row" style={{borderBottom: '5px solid #DCDCDC'}}>
          <Typography variant='subtitle2'>
            Day
          </Typography>
        </TableCell>
        <TableCell component="th" scope="row" style={{borderBottom: '5px solid #DCDCDC'}}>
          <Typography variant='subtitle2'>
            Date
          </Typography>
        </TableCell>
        {this.state.headerData.map((item, i) => (
          <TableCell component="th" scope="row" key={i} align="right" style={{borderBottom: '5px solid ' + item.color}}>
            <Typography variant='subtitle2'>
              {capitalize(item.name)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {capitalize(item.type)}
            </Typography>
          </TableCell>
        ))}
        <TableCell component="th" scope="row" align="right" style={{borderBottom: '5px solid #71CA71'}}>
          <Typography variant='subtitle2'>
            Total
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  renderTableData() {
    return this.state.dailyData.map((row, i) => {
      return (
          <TableRow key={i} hover style={moment(this.state.today).isSame(row.date) ? {backgroundColor: '#D3F1D3'} : {} }>
            <TableCell component="th" scope="row" className={this.props.classes.tableCell}>
              {moment(row.date).format('ddd')}
            </TableCell>
            <TableCell component="th" scope="row" className={this.props.classes.tableCell}>
              {row.date}
            </TableCell>
            {this.innerCells(row)}
            <TableCell component="th" scope="row"  align="right" className={this.props.classes.tableCell}>
              {decimals(row.total)}
            </TableCell>
        </TableRow>
      )
    })
  }

  innerCells(row){
    return this.state.headerData.map((item, idx) => {
      if(row[item.id]){
        if(row[item.id].comment){
          return (
            <Tooltip key={idx} 
              style={{whiteSpace: 'pre-line'}}
              title={
                <React.Fragment>
                  {row[item.id].comment.map((comment, i) => {
                    return (
                      <Typography key={i} className={this.props.classes.tableCell}>
                        {comment}
                      </Typography>
                    )
                  })}
                </React.Fragment>
              }
            >
              <TableCell key={idx} component="th" scope="row"  align="right" className={this.props.classes.tableCell}>
                {row[item.id].total}
              </TableCell>
            </Tooltip>
          )
        } else {
          return (
            <TableCell key={idx} component="th" scope="row"  align="right" className={this.props.classes.tableCell}>
              {row[item.id].total}
            </TableCell>
          )
        }
      } else {
        return (
          <TableCell key={idx} component="th" scope="row"  align="right" className={this.props.classes.tableCell}>
          </TableCell>
        )
      }
    })
  }

  render(){
    return (
      <React.Fragment>
        <TableContainer component={Paper} style={{maxHeight: '90vh'}}>
          <Table  aria-label="simple table" size="small" padding="checkbox" stickyHeader>
            <TableHead>
              {this.renderHeaders()}
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

export default withStyles(styles)(Sheet);