import React from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { capitalize, decimals } from "../Services/helpers";


class SidePanel extends React.Component {

  render() {
    return (
      <div>
        <div style={this.props.expensesByCategory.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <Box pl={2} pt={1}>
            <Grid container spacing={1}>
              <Grid item>
                <ReceiptIcon />
              </Grid>
              <Grid item xs={10}>
                <Typography variant="h6">
                  Expenses By Category
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <List>
            {this.props.expensesByCategory.map((item, key) => (
              <Container maxWidth="xl" key={key}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography noWrap align="left">
                      {capitalize(item.category)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography noWrap align="right">
                      {decimals(item.amount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
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
                <ListItemText key={key} primary={capitalize(item.account)} secondary={decimals(item.amount)} />
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
                <ListItemText key={key} primary={capitalize(item.account)} secondary={decimals(item.amount)} />
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
                <ListItemText key={key} primary={capitalize(item.account)} secondary={decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
        </div>
        
      </div>
    );
  }
}

export default SidePanel;
