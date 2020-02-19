import React from 'react';
import axios from 'axios';
import PropTypes from "prop-types";
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { capitalize, decimals } from "../Services/helpers";


class ExpensesList extends React.Component {

  static propTypes = {
    expenses: PropTypes.array,
  };

  state = {
    expenses: []
  }

  componentDidMount() {
    axios.get('/expenses_bulk?page=1')
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({ expenses: data.data })
        }
      })
  }

  render() {
    return (
      <Container maxWidth="xl">
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box pl={2} pt={1}>
              <Typography variant="h3" noWrap>
                Expenses
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box pl={2} pt={1}>
              <Typography variant="h3" noWrap align="right">
                {this.props.totalExpenses}
              </Typography>
              <Typography noWrap align="right">
                Total this {this.props.timeframe}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Divider mb={8} />
        <Grid container spacing={1} mt={8}>
          <Grid item xs={2}>
            <Typography variant="h6" noWrap align="center">
              Date
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h6" noWrap align="center">
              Amount
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h6" noWrap align="center">
              Comment
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h6" noWrap align="center">
              Category
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h6" noWrap align="center">
              Account
            </Typography>
          </Grid>
        </Grid>
        <Divider mb={8} />
        <List style={this.state.expenses.length > 0 ? { display: 'block' } : { display: 'none' }}>
          {this.state.expenses.map((item, key) => (
            <Grid container spacing={1} key={key}>
              <Grid item xs={2}>
                <Typography align="right">
                  {item.date}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">
                  {decimals(item.amount)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">
                  {item.comment}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography align="right">
                  {capitalize(item.category)}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography align="right">
                  {capitalize(item.account)}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </List>
      </Container>
    )
  }

}

export default ExpensesList;
