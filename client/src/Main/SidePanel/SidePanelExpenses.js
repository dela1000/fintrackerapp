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
      <Box pt={1} pr={2} pb={1} pl={2} style={props.open ? { display: 'block' } : { display: 'none' }}>
        {expensesByCategory.map((item, key) => (
          <ListItem button key={key} onClick={() => props.selectCategory(item)}>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                {capitalize(item.category)}
              </Grid>
              <Grid item>
                {decimals(item.amount)}
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </Box>
      
    )
  }
}

