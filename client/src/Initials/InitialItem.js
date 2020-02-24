import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import { capitalize } from "../Services/helpers";

export default function InitialItem(props) {
  const rowsLength = props.rowsLength;
  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justify="center"
      >
        <Grid item xs>
          <TextField
            required
            fullWidth
            type="number"
            name="amount" 
            id="outlined-basic"
            label="Amount"
            autoComplete="off"
            value={props.item.amount || ''}
            onChange={props.handleChange(props.index)}
          />
        </Grid>
        <Grid item xs>
          <TextField
            required
            fullWidth
            type="text"
            name="name" 
            id="outlined-basic"
            label="Account Name"
            autoComplete="off"
            value={props.item.name  || ''}
            onChange={props.handleChange(props.index)}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            required
            fullWidth
            id="typeId"
            name="typeId" 
            select
            label="Account Type"
            onChange={props.handleChange(props.index)}
            value={props.item.typeId || ''}
          >
            {props.types.map(src => (
              <MenuItem key={src.id} value={src.id}>
                {capitalize(src.type)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid 
          item xs={1}
          style={props.item.typeId === 1 ? {display: 'block'} : {display: 'none'}}
        >
          <Box pt={3}>
            <FormControlLabel
              control={
                <Checkbox
                  id="primary"
                  name="primary"
                  checked={props.item.primary}
                  onChange={props.handlePrimary(props.index)}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              }
              label="Primary"
            />
          </Box>
        </Grid>
        <Grid item xs={1}
          style={rowsLength <= 1 ? {display: 'none'} : {}}
        >
          <Box pt={3}>
            <button
              type="button"
              style={{float:"right"}}
              onClick={props.handleRemoveRow(props.index)}
            >
              -
            </button>
          </Box>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}
