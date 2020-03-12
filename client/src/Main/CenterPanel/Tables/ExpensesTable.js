import React from 'react';

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

const headers = [
  {name: 'date', align: "left"},
  {name: 'comment', align: ""},
  {name: 'category', align: ""},
  {name: 'account', align: ""},
  {name: 'amount', align: "right"},
]

class ExpensesTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    const { classes, listingData } = this.props;
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
          <TableBody>
            {listingData.map(item => (
              <TableRow key={item.id} hover>
                <TableCell >{item.date}</TableCell>
                <TableCell>{item.comment}</TableCell>
                <TableCell>{capitalize(item.expensescategory.name)}</TableCell>
                <TableCell>{capitalize(item.account)}</TableCell>
                <TableCell align="right">{decimals(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
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

