import React from 'react';
// import PropTypes from "prop-types";
// import Paper from '@material-ui/core/Paper';
// import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
// import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
// import TrendingUpIcon from '@material-ui/icons/TrendingUp';

class SidePanel extends React.Component {

  capitalize(str){
    return str.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  };

  componentDidMount() {
    console.log("+++ 25 SidePanel.js this.props.availableByAccount.checking: ", this.props.availableByAccount.checking)
  }

  render() {
    return (
      <div>
        {this.props.availableByAccount.checking.map((item, key) => (
          <ListItemText key={key} primary={item.amount} secondary={key} />
        ))}
      </div>
    );
  }
}

export default SidePanel;



// import React from 'react';
// import PropTypes from "prop-types";
// import Paper from '@material-ui/core/Paper';
// import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
// import ListItemText from '@material-ui/core/ListItemText';
// import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
// import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
// import TrendingUpIcon from '@material-ui/icons/TrendingUp';

// class SidePanel extends React.Component {

//   static propTypes = {
//     availableByAccount: PropTypes.object,
//   };

//   constructor(props) {
//     super(props);

//     this.state = {
//       sidePanel: {
//         availableByAccount: {
//           checking: [],
//           savings: [],
//           investments: [],
//         },
//         expensesByCategory: [],
//         fundsByTypes: [],
//       },
//     };
//   };

//   capitalize(str){
//     return str.toLowerCase()
//       .split(' ')
//       .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
//       .join(' ');
//   };

//   decimals(num){
//     return num.toFixed(2)
//   }

//   selectItem(item){
//     console.log("+++ 67 SidePanel.js item: ", item)
//   }

//   componentWillMount() {
//     this.setState({availableByAccount: this.props.availableByAccount}, ()=> {
//       console.log("+++ 46 SidePanel.js this.state: ", this.state)
//     })
//   }

//   render () {
//     return (
//       <Grid container spacing={1}>
//       <Grid item xs={2}>
//         <Paper>
//           <Typography variant="h6" noWrap style={this.state.sidePanel.availableByAccount.checking.length > 0 ? { display: 'block' } : { display: 'none' }}>
//             Checking
//           </Typography>
//           <List style={this.state.sidePanel.availableByAccount.checking.length > 0 ? { display: 'block' } : { display: 'none' }}>
//             {this.state.sidePanel.availableByAccount.checking.map((item, index) => (
//               <ListItem button key={index} onClick={() => this.selectItem(item)}>
//                 <ListItemIcon>
//                   <AttachMoneyIcon />
//                 </ListItemIcon>
//                 <ListItemText primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
//               </ListItem>
//             ))}
//           </List>
//           <Typography variant="h6" noWrap style={this.state.sidePanel.availableByAccount.savings.length > 0 ? { display: 'block' } : { display: 'none' }}>
//             Savings
//           </Typography>
//           <List style={this.state.sidePanel.availableByAccount.savings.length > 0 ? { display: 'block' } : { display: 'none' }}>
//             {this.state.sidePanel.availableByAccount.savings.map((item, index) => (
//               <ListItem button key={index} onClick={() => this.selectItem(item)}>
//                 <ListItemIcon>
//                   <AccountBalanceIcon />
//                 </ListItemIcon>
//                 <ListItemText primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
//               </ListItem>
//             ))}
//           </List>
//           <Typography variant="h6" noWrap style={this.state.sidePanel.availableByAccount.investments.length > 0 ? { display: 'block' } : { display: 'none' }}>
//             Investments
//           </Typography>
//           <List style={this.state.sidePanel.availableByAccount.investments.length > 0 ? { display: 'block' } : { display: 'none' }}>
//             {this.state.sidePanel.availableByAccount.investments.map((item, index) => (
//               <ListItem button key={index} onClick={() => this.selectItem(item)}>
//                 <ListItemIcon>
//                   <TrendingUpIcon />
//                 </ListItemIcon>
//                 <ListItemText primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
//               </ListItem>
//             ))}
//           </List>
//         </Paper>
//       </Grid>
//       <Grid item xs={7}>
//         <Paper>xs</Paper>
//       </Grid>
//       <Grid item xs={3}>
//         <Paper>xs</Paper>
//       </Grid>
//     </Grid>
//     )
//   }
// }

// export default SidePanel;