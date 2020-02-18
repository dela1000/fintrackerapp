import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';


class SidePanel extends React.Component {

  capitalize(str){
    return str.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  };

  decimals(num){
    return num.toFixed(2)
  }

  render() {
    return (
      <div>
        <div style={this.props.expensesByCategory.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Box pl={2} pt={1}>
            <Typography variant="h6" noWrap>
              Expenses
            </Typography>
          </Box>
          <List>
            {this.props.expensesByCategory.map((item, key) => (
              <div key={key}>
                <div>
                  {item.category} {item.amount}
                </div>
              </div>
            ))}
          </List>
        </div>
        <Divider />
        <div style={this.props.availableByAccount.checking.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Box pl={2} pt={1}>
            <Typography variant="h6" noWrap>
              Checking
            </Typography>
          </Box>
          <List>
            {this.props.availableByAccount.checking.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText key={key} primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
        </div>
        <div style={this.props.availableByAccount.savings.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Box pl={2} pt={1}>
            <Typography variant="h6" noWrap>
              Savings
            </Typography>
          </Box>
          <List>
            {this.props.availableByAccount.savings.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemIcon>
                  <AccountBalanceIcon />
                </ListItemIcon>
                <ListItemText key={key} primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
        </div>
        <div style={this.props.availableByAccount.investments.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Box pl={2} pt={1}>
            <Typography variant="h6" noWrap>
              Investments
            </Typography>
          </Box>
          <List>
            {this.props.availableByAccount.investments.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemIcon>
                  <TrendingUpIcon />
                </ListItemIcon>
                <ListItemText key={key} primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
        </div>
        
      </div>
    );
  }
}

export default SidePanel;
