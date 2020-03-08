import React from 'react';
import PropTypes from 'prop-types';

import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { withStyles } from '@material-ui/core/styles';

import { capitalize, decimals } from "../../Services/helpers.js";

function loadMore(type) {
  
}

const expensesHeaders = ['Date', 'Comment', 'Account', 'Category', 'Amount'];
const fundsHeaders = ['Date', 'Comment', 'Account', 'Source',  'Type', 'Amount'];
const categoryHeaders = ['Date', 'Comment', 'Account', 'Source',  'Type', 'Amount'];


const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class ListingPanel extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    const { classes, viewSelected } = this.props;
    console.log("+++ 37 ListingPanel.js this.props: ", JSON.stringify(this.props, null, "\t"));
    return (
      <React.Fragment>
        
        <Typography align="left" variant="h5">
          {capitalize(viewSelected)}
        </Typography>
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
            TABLE GOES HERE
          </TableBody>
        </Table>
        <div className={classes.seeMore}>
          <Link color="primary" href="#" onClick={() => loadMore(viewSelected)}>
            Load More
          </Link>
        </div>
      </React.Fragment>
    );
  }
}

ListingPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ListingPanel);


// {props.listingData.map(item => (
//   <TableRow key={item.id} hover>
//     <TableCell>{item.date}</TableCell>
//     <TableCell>{item.comment}</TableCell>
//     <TableCell onClick={() => props.selectAccount(item)}>{capitalize(item.account)}</TableCell>
//     <TableCell onClick={() => props.selectCategory(item)}>{capitalize(item.category)}</TableCell>
//     <TableCell align="right">{decimals(item.amount)}</TableCell>
//   </TableRow>
// ))}


// import React from 'react';
// import Link from '@material-ui/core/Link';
// import { makeStyles } from '@material-ui/core/styles';
// import Typography from '@material-ui/core/Typography';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import { capitalize, decimals } from "../../Services/helpers.js";
// // import Title from './Title';

// function loadMore(type) {
  
// }

// const useStyles = makeStyles(theme => ({
//   seeMore: {
//     marginTop: theme.spacing(3),
//   },
// }));

// export default function Orders(props) {
//   const classes = useStyles();
//   if(props.viewSelected === "expenses"){
//     return (
//       <React.Fragment>
//         <Typography align="left" variant="h5">
//           {capitalize(props.viewSelected)}
//         </Typography>
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Date</TableCell>
//               <TableCell>Comment</TableCell>
//               <TableCell>Account</TableCell>
//               <TableCell>Category</TableCell>
//               <TableCell align="right">Amount</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {props.listingData.map(item => (
//               <TableRow key={item.id} hover>
//                 <TableCell>{item.date}</TableCell>
//                 <TableCell>{item.comment}</TableCell>
//                 <TableCell onClick={() => props.selectAccount(item)}>{capitalize(item.account)}</TableCell>
//                 <TableCell onClick={() => props.selectCategory(item)}>{capitalize(item.category)}</TableCell>
//                 <TableCell align="right">{decimals(item.amount)}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         <div className={classes.seeMore}>
//           <Link color="primary" href="#" onClick={() => loadMore(props.viewSelected)}>
//             Load More
//           </Link>
//         </div>
//       </React.Fragment>
//     );
//   }
//   if(props.viewSelected === "funds"){
//     return (
//       <React.Fragment>
//         <Typography align="left" variant="h5">
//           {capitalize(props.viewSelected)}
//         </Typography>
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Date</TableCell>
//               <TableCell>Comment</TableCell>
//               <TableCell>Account</TableCell>
//               <TableCell>Source</TableCell>
//               <TableCell align="right">Amount</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {props.listingData.map(item => (
//               <TableRow key={item.id} hover>
//                 <TableCell>{item.date}</TableCell>
//                 <TableCell>{item.comment}</TableCell>
//                 <TableCell onClick={() => props.selectAccount(item)}>{capitalize(item.account)}</TableCell>
//                 <TableCell onClick={() => props.selectCategory(item)}>{capitalize(item.source)}</TableCell>
//                 <TableCell align="right">{decimals(item.amount)}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         <div className={classes.seeMore}>
//           <Link color="primary" href="#" onClick={() => loadMore(props.viewSelected)}>
//             Load More
//           </Link>
//         </div>
//       </React.Fragment>
//     )
//   }
//   if(props.viewSelected === "category"){
//     return (
//       <React.Fragment>
//         <Typography align="left" variant="h5">
//           {capitalize(props.viewSelected)}
//         </Typography>
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Date</TableCell>
//               <TableCell>Comment</TableCell>
//               <TableCell>Account</TableCell>
//               <TableCell>Source</TableCell>
//               <TableCell align="right">Amount</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {props.listingData.map(item => (
//               <TableRow key={item.id} hover>
//                 <TableCell>{item.date}</TableCell>
//                 <TableCell>{item.comment}</TableCell>
//                 <TableCell onClick={() => props.selectAccount(item)}>{capitalize(item.account)}</TableCell>
//                 <TableCell onClick={() => props.selectCategory(item)}>{capitalize(item.source)}</TableCell>
//                 <TableCell align="right">{decimals(item.amount)}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         <div className={classes.seeMore}>
//           <Link color="primary" href="#" onClick={() => loadMore(props.viewSelected)}>
//             Load More
//           </Link>
//         </div>
//       </React.Fragment>
//     )
//   }
// }
