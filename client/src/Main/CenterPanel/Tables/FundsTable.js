import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import Link from '@material-ui/core/Link';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
import { capitalize, decimals, dateFormat } from "../../../Services/helpers.js";

function loadMore(type) {
  
}

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  tableCell: {
    fontSize: '12px'
  }
});

class FundsTable extends React.Component {

  setTable = () => {
    let colors = this.props.colors;
    let headers = [
      {name: 'date', align: "left"},
      {name: 'comment', align: "left"},
      {name: 'source', align: "left"},
      {name: 'account', align: "left"},
    ];

    let transferFound = false;
    _.forEach(this.props.listingData, (item) => {
      item.transferAccountData = {};
      if(item.transferAccountId){
        item.transferAccountData = this.props.userAccounts.find(x => x.id === item.transferAccountId); 
        transferFound = true;
      }
    })

    if(transferFound){
      headers.push({name: "Transfer Account", align: 'left'})
    }
    headers.push({name: 'amount', align: "right"})
    
    let today = moment().format(dateFormat);
  
    if(transferFound){
      return (
        <Table aria-label="simple table" size="small" padding="checkbox" stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((item, i) => (
                <TableCell 
                    key={i} 
                    align={item.align}
                    // style={ !_.isEmpty(colors) ? {borderLeft: '10px solid ' + colors[i].color} : {}}
                  >
                  <Typography onClick={() => this.props.sortListingData(item.name)} style={{cursor: 'pointer'}}>
                    {capitalize(item.name)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.listingData.map((item, i) => (
              <TableRow key={i} hover onClick={() => this.props.openDetailsDrawer({item: item, type: 'funds'})} style={moment(today).isSame(item.date) ? {backgroundColor: '#D3F1D3'} : {} }>
                <TableCell className={this.props.classes.tableCell}>
                  {item.date}
                </TableCell>
                <TableCell className={this.props.classes.tableCell}>
                  {item.comment}
                </TableCell>
                <TableCell className={this.props.classes.tableCell}>
                  {capitalize(item.account)}
                </TableCell>
                <TableCell className={this.props.classes.tableCell}>
                  {capitalize(item.source)}
                </TableCell>
                <TableCell className={this.props.classes.tableCell}>
                  {capitalize(item.transferAccountData.account)}
                </TableCell>
                <TableCell align="right">{decimals(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> 
      )
    } else {
      return (
        <Table aria-label="simple table" size="small" padding="checkbox" stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((item, i) => (
                <TableCell key={i} align={item.align}>
                  <Typography>
                    {capitalize(item.name)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.listingData.map((item, i) => (
                <TableRow key={i} hover onClick={() => this.props.openDetailsDrawer({item: item, type: 'funds'})}>
                <TableCell className={this.props.classes.tableCell}>{item.date}</TableCell>
                <TableCell className={this.props.classes.tableCell}>{item.comment}</TableCell>
                <TableCell className={this.props.classes.tableCell}>{capitalize(item.account)}</TableCell>
                <TableCell className={this.props.classes.tableCell}>{capitalize(item.source)}</TableCell>
                <TableCell className={this.props.classes.tableCell} align="right">{decimals(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
  }

  render () {
    const { classes } = this.props;
    return (
      <TableContainer component={Paper}>
        {this.setTable()}
        <div className={classes.seeMore}>
          <Link color="primary" href="#" onClick={() => loadMore()}>
            Load More
          </Link>
        </div>
      </TableContainer>
    )
  }
}

export default withStyles(styles)(FundsTable);

