import React from 'react';
import _ from 'lodash'
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { capitalize, decimals } from "../../Services/helpers";

export default function SidePanelExpenses(props) {
  let expensesByCategory = props.expensesByCategory || [];
  if(_.isEmpty(props.expensesCategories)){
    return (
      <Box p={3}>
        Add Expense categories
      </Box>
    )
  } else {
    return (
      <List style={props.open ? { display: 'block' } : { display: 'none' }}>
        {expensesByCategory.map((item, key) => (
          <ListItem button key={key} onClick={() => props.selectCategory(item)}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography align="left">
                  {capitalize(item.category)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" style={item.amount < 0 ? {color: 'red'} : {} }>
                  {decimals(item.amount)}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    )
  }
}

