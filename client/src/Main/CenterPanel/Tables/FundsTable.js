import React from 'react';
import _ from 'lodash';

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
import { capitalize, decimals } from "../../../Services/helpers.js";

function loadMore(type) {
  
}

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});


class FundsTable extends React.Component {


  setTable = () => {
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

    if(transferFound){
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
                <TableCell >{item.date}</TableCell>
                <TableCell>{item.comment}</TableCell>
                <TableCell>{capitalize(item.account)}</TableCell>
                <TableCell>{capitalize(item.source)}</TableCell>
                <TableCell>{capitalize(item.transferAccountData.account)}</TableCell>
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
                <TableCell >{item.date}</TableCell>
                <TableCell>{item.comment}</TableCell>
                <TableCell>{capitalize(item.account)}</TableCell>
                <TableCell>{capitalize(item.source)}</TableCell>
                <TableCell align="right">{decimals(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
  }

  render () {
    const { 
      classes, 
      listingData, 
      openDetailsDrawer 
    } = this.props;
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

