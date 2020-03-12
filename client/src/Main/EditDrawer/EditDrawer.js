import React from 'react';
import moment from 'moment';
import _ from 'lodash'

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import DeleteIcon from '@material-ui/icons/Delete';

import { withStyles } from '@material-ui/core/styles';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { capitalize, decimals, to2Fixed } from "../../Services/helpers";

const styles = theme => ({
  drawer: {
      width: 450,
    },
    container: {
      width: 'auto',
      paddingLeft: theme.spacing(4),
      marginLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      marginRight: theme.spacing(4),
      paddingTop: theme.spacing(4),
      marginTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
    item:{
      marginTop: theme.spacing(4),
    }
})

class EditDraw extends React.Component {

  render () {
    const { 
      classes, 
      right, 
      toggleDrawer, 
      dataToEdit, 
      handleEditDateChange,
      handleEditChange,
      expensesCategories,
      fundSources,
      accounts, 
    } = this.props;

    return (
      <SwipeableDrawer
        anchor="right"
        open={right}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <div className={classes.drawer} role="presentation">
          <Box>
            <Button size="small" color="primary" style={{float: 'right'}} onClick={toggleDrawer(false)}>
              Close
            </Button>
          </Box>
          <Box className={classes.container}>
            <Typography variant="h6" color="inherit" noWrap className={classes.title}>
              Edit {capitalize(dataToEdit.type)} Item
            </Typography>
            <Grid container justify="center" spacing={2}>
              <MuiPickersUtilsProvider utils={DateFnsUtils} className={classes.item}>
                <KeyboardDatePicker
                  autoFocus
                  fullWidth
                  autoOk
                  allowKeyboardControl
                  autoComplete="off"
                  margin="normal"
                  id="date-picker-dialog"
                  label="Date of Transaction"
                  format="MM-dd-yyyy"
                  value={dataToEdit.date}
                  KeyboardButtonProps={{ 'aria-label': 'change date' }}
                  onChange={(date) => handleEditDateChange(date)}
                />
              </MuiPickersUtilsProvider>
              <TextField 
                fullWidth
                type="number" 
                name="amount" 
                id="outlined-basic" 
                label="Amount" 
                autoComplete="off"
                value={dataToEdit.amount} 
                onChange={(e) => handleEditChange(e)} 
                className={classes.item}
              />
              <TextField 
                fullWidth
                type="text" 
                name="comment" 
                id="outlined-basic" 
                label="Comment" 
                autoComplete="off"
                value={dataToEdit.comment} 
                onChange={(e) => handleEditChange(e)} 
                className={classes.item}
              />
              <TextField
                fullWidth
                id="categories"
                select
                label="Select category"
                name="categoryId"
                value={dataToEdit.category || ''}
                onChange={(e) => handleEditChange(e)}
                className={classes.item}
                style={dataToEdit.type === "expenses" ? {} : { display: 'none' }}
              >
                {expensesCategories.map(cat => (
                  <MenuItem key={cat.id} value={cat}>
                    {capitalize(cat.name)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                id="source"
                select
                label="Select Source"
                name="source"
                value={dataToEdit.source || ''}
                onChange={(e) => handleEditChange(e)}
                className={classes.item}
                style={dataToEdit.type === "funds" ? {} : { display: 'none' }}
              >
                {fundSources.map(src => (
                  <MenuItem key={src.id} value={src}>
                    {capitalize(src.source)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                id="account"
                select
                label="Select Account"
                name="account"
                value={dataToEdit.account || ''}
                onChange={(e) => handleEditChange(e)}
                className={classes.item}
              >
                {accounts.map(acc => (
                  <MenuItem key={acc.id} value={acc}>
                    {capitalize(acc.account)} - {capitalize(acc.type)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid 
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid>
                <Box mt={2} pt={2} pl={1} pb={1}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DeleteIcon/>}
                  >
                    Delete
                  </Button>
                </Box> 
              </Grid>
              <Grid>
                <Box mt={2} pt={2} pl={1} pb={1} style={{'float': 'right'}}>
                  <Button
                    variant="contained"
                    color="primary"
                  >
                    Update
                  </Button>
                </Box> 
              </Grid>
            </Grid>
          </Box>
        </div>
      </SwipeableDrawer>
    )
  }
}


export default withStyles(styles)(EditDraw);