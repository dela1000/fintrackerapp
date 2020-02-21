import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { capitalize, decimals } from "../Services/helpers";
// import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Orders(props) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Comment</TableCell>
            <TableCell>Account</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.expensesData.map(item => (
            <TableRow key={item.id} hover>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.comment}</TableCell>
              <TableCell onClick={() => props.selectAccount(item)}>{capitalize(item.account)}</TableCell>
              <TableCell onClick={() => props.selectCategory(item)}>{capitalize(item.category)}</TableCell>
              <TableCell align="right">{decimals(item.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" href="#" onClick={preventDefault}>
          Load More
        </Link>
      </div>
    </React.Fragment>
  );
}
