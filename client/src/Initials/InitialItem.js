import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { capitalize, decimals } from "../Services/helpers";

export default function InitialItem(props) {
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
            fullWidth
            type="number"
            name="amount" 
            id="outlined-basic"
            label="Amount"
            autoComplete="off"
            value={props.item.amount}
            onChange={props.handleChange(props.index)}
          />
        </Grid>
        <Grid item xs>
          <TextField
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
        <Grid item xs>
          <TextField
            fullWidth
            id="typeId"
            name="type" 
            select
            label="Account Type"
            onChange={props.handleChange(props.index)}
            value={props.item.type || null}
          >
            {props.types.map(src => (
              <MenuItem key={src.id} value={src.id}>
                {capitalize(src.type)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={2}>
          <button
            type="button"
            onClick={props.handleRemoveRow(props.index)}
          >
            -
          </button>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}




// import React from 'react';
// import Grid from '@material-ui/core/Grid';
// import TextField from '@material-ui/core/TextField';
// import MenuItem from '@material-ui/core/MenuItem';
// import { capitalize, decimals } from "../Services/helpers";

// export default function InitialItem(props) {
//   console.log("+++ 8 InitialItem.js props: ", props)
//   let [typeId, setType] = React.useState("");
//   let [amount, setAmount] = React.useState("");
//   let [account, setAccount] = React.useState("");

//   const handleAmount = event => {
//     setType(event.target.value);
//   };

//   const handleAccount = event => {
//     setAccount(event.target.value);
//   };

//   const typeChange = event => {
//     setType(event.target.value);
//   };

//   return (
//     <React.Fragment>
//       <Grid
//         container
//         spacing={2}
//         alignItems="center"
//         justify="center"
//       >
//       <Grid item xs>
//         <TextField 
//           fullWidth
//           type="number" 
//           name="amount" 
//           id="outlined-basic" 
//           label="Amount" 
//           autoComplete="off"
//           onChange={handleAmount}
//           value={amount}
//         />
//       </Grid>
//       <Grid item xs>
//         <TextField 
//           fullWidth
//           type="text" 
//           name="account" 
//           id="outlined-basic" 
//           label="Account" 
//           autoComplete="off"
//           onChange={handleAccount}
//           value={account}
//         />
//       </Grid>
//       <Grid item xs>
//         <TextField
//           fullWidth
//           id="type"
//           select
//           label="Type"
//           onChange={typeChange}
//           value={typeId}
//         >
//           {props.types.map(src => (
//             <MenuItem key={src.id} value={src.id}>
//               {capitalize(src.type)}
//             </MenuItem>
//           ))}
//         </TextField>
//       </Grid>
//       <Grid item xs={1}>
//         Primary
//       </Grid>
//     </Grid>
//     </React.Fragment>
//   )
// }

