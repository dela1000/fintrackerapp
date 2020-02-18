import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
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

  componentDidMount() {
    console.log("+++ 25 SidePanel.js this.props.availableByAccount.checking: ", this.props.availableByAccount.checking)
  }

  render() {
    return (
      <div>
        <div style={this.props.availableByAccount.checking.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Typography variant="h6" noWrap>
            Checking
          </Typography>
          <List>
            {this.props.availableByAccount.checking.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText key={key} primary={this.capitalize(item.account)} secondary={item.amount} />
              </ListItem>
            ))}
          </List>
        </div>
        <div style={this.props.availableByAccount.savings.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Typography variant="h6" noWrap>
            Savings
          </Typography>
          <List>
            {this.props.availableByAccount.savings.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemIcon>
                  <AccountBalanceIcon />
                </ListItemIcon>
                <ListItemText key={key} primary={this.capitalize(item.account)} secondary={item.amount} />
              </ListItem>
            ))}
          </List>
        </div>
        <div style={this.props.availableByAccount.investments.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Typography variant="h6" noWrap>
            Investments
          </Typography>
          <List>
            {this.props.availableByAccount.investments.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemIcon>
                  <TrendingUpIcon />
                </ListItemIcon>
                <ListItemText key={key} primary={this.capitalize(item.account)} secondary={item.amount} />
              </ListItem>
            ))}
          </List>
        </div>
        
      </div>
    );
  }
}

export default SidePanel;
