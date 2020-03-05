import React from 'react';
import _ from 'lodash'
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import AddTypeModal from './AddTypeModal.js';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';

import { capitalize, decimals } from "../../Services/helpers";

export default function SidePanelExpenses(props) {
  return (
    <React.Fragment>
      <AddTypeModal 
        open={props.open}
        type={'category'}
        itemName={'name'}
        currentItems={props.expensesCategories}
      />
      <Box pt={1} pr={2} pb={1} pl={2} style={props.open ? { display: 'block' } : { display: 'none' }}>
        {props.expensesByCategory.map((item, key) => (
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
    </React.Fragment>
  )
}

