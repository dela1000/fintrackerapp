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

const headers = [
  {name: 'date', align: "left"},
  {name: 'comment', align: "left"},
  {name: 'category', align: "left"},
  {name: 'account', align: "left"},
  {name: 'amount', align: "right"},
]

class ExpensesTable extends React.Component {

  defineTable = () => {
    let colors = this.props.colors;
    let listingData = this.props.listingData;
    let today = moment().format(dateFormat);
    return (
      <TableBody>
        {listingData.map((item, i) => (
          <TableRow 
            key={i} 
            hover 
            onClick={() => this.props.openDetailsDrawer({item: item, type: 'expenses'})}
            style={moment(today).isSame(item.date) ? {backgroundColor: '#D3F1D3'} : {} }
          >
            <TableCell
              className={this.props.classes.tableCell}
              style={ !_.isEmpty(colors) ? {borderLeft: '10px solid ' + colors[item.categoryId].color} : {}}
            >
              {item.date}
            </TableCell>
            <TableCell className={this.props.classes.tableCell}>
              {item.comment}
            </TableCell>
            <TableCell className={this.props.classes.tableCell}>
              {capitalize(item.expensescategory.name)}
            </TableCell>
            <TableCell className={this.props.classes.tableCell}>
              {capitalize(item.account)}
            </TableCell>
            <TableCell align="right" className={this.props.classes.tableCell}>
              {decimals(item.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    )
  }

  render () {
    const { classes } = this.props;
    return (
      <TableContainer component={Paper}>
        <Table  aria-label="simple table" size="small" padding="checkbox" stickyHeader>
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
          {this.defineTable()}
        </Table>
        <div className={classes.seeMore}>
          <Link color="primary" href="#" onClick={() => loadMore()}>
            Load More
          </Link>
        </div>
      </TableContainer>
    )
  }
}

export default withStyles(styles)(ExpensesTable);