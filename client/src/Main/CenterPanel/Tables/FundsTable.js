import React from 'react';

import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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
  constructor(props) {
    super(props);
  }

  render () {
    const { classes, listingData, listingDataSelected } = this.props;
    return (
      <React.Fragment>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
            <TableBody>
              {listingData.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell >{item.date}</TableCell>
                  <TableCell>{item.comment}</TableCell>
                  <TableCell>{capitalize(item.account)}</TableCell>
                  <TableCell>{capitalize(item.source)}</TableCell>
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
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(FundsTable);

