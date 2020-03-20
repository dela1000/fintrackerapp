import React from 'react';
import _ from 'lodash';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import AddTypeModal from './AddTypeModal.js';

import { capitalize, decimals } from "../../Services/helpers";

export default function SidePanelExpenses(props) {
  let colors = props.colors;
  return (
    <React.Fragment>
      <AddTypeModal 
        open={props.open}
        type={'category'}
        itemName={'name'}
        currentItems={props.expensesCategories}
        getAllTotals={props.getAllTotals}
      />
      <Box pt={1} pr={2} pb={1} pl={2} style={props.open ? { display: 'block' } : { display: 'none' }}>
        {props.expensesByCategory.map((item, key) => (
          <ListItem 
            button 
            key={key} 
            onClick={() => props.updateListingData({type: 'expenses', name: item.category, categoryId: item.categoryId})}
            style={ !_.isEmpty(colors) ? {paddingTop: '5px', paddingBottom: '0px', borderLeft: '8px solid ' + colors[item.categoryId].color} : {}}
            >
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

