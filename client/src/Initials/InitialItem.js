import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { capitalize } from "../Services/helpers";

export default function InitialItem(props) {
  let label = props.label + " Name";
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
            type="text"
            name={props.name} 
            id="outlined-basic"
            label={capitalize(label)}
            autoComplete="off"
            value={props.item.name  || ''}
            onChange={props.handleFunction(props.index)}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  )
}
