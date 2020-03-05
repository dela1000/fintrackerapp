import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import TextField from '@material-ui/core/TextField';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { capitalize, decimals } from "../../Services/helpers";
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { post_expenses_bulk, post_funds_bulk } from "../../Services/WebServices";

const styles = theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    padding: theme.spacing(8, 8, 8),
  },
});


class AddModal extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      classes: {},
      open: false,
      selectedDate: null,
      amount: "",
      comment: "",
      categoryId: "",
      sourceId: "",
      account: {
        account: ""
      },
      itemsAdded: []
    }
  }


  handleOpen(value) {
    this.setState({ open: value });
  };

  handleDateChange (e) {
    let date = moment(e).format('MM-DD-YYYY');
    this.setState({selectedDate: date});
  };

  handleChange (e) {
    console.log("+++ 73 AddModal.js e.target.name: ", e.target.name)
    console.log("+++ 74 AddModal.js e.target.value: ", e.target.value)
    this.setState({[e.target.name]: e.target.value}, () => {
      console.log("this.state: ", JSON.stringify(this.state, null, "\t"));
    })
  }
  
  addMore () {
    var accountSelected = this.props.userAccounts.find(x => x.id === this.state.account.id);
    var newItem = {
      date: moment(this.state.selectedDate).format('MM-DD-YYYY'),
      amount: this.state.amount,
      comment: this.state.comment || null, 
      accountId: accountSelected.id,
    }
    if(this.props.type === "expenses"){
      if(this.state.selectedDate && this.state.amount && this.state.account && this.state.categoryId){
        newItem['categoryId'] = this.state.categoryId;
        this.setState(prevState => ({
          itemsAdded: [...prevState.itemsAdded, newItem]
        }))
      }
    } 
    if (this.props.type === "funds") {
      if (this.state.selectedDate && this.state.amount && accountSelected && this.state.sourceId) {
        newItem['typeId'] = accountSelected.typeId;
        newItem['sourceId'] = this.state.sourceId;
        this.setState({
            itemsAdded: [...this.state.itemsAdded, newItem]
        })
      }
    }
    this.clearAfterSubmit();
  }

  clearAfterSubmit () {
    this.setState({
      selectedDate: null,
      amount: "",
      comment: "",
      categoryId: "",
      sourceId: "",
      account: {
        account: ""
      }
    })
  }

  render(){
    const { classes } = this.props;
    return (
      <div>
        <AddCircleIcon onClick={() => this.handleOpen(true)} />
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={this.state.open}
          onClose={() => this.handleOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
          timeout: 500,
          }}
        >
          <Fade in={this.state.open}>
            <div className={classes.paper}>
              <h2>Add {capitalize(this.props.type)}</h2>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container justify="space-around">
                  <KeyboardDatePicker
                    fullWidth
                    margin="normal"
                    id="date-picker-dialog"
                    label="Select Date of Transaction"
                    format="MM-dd-yyyy"
                    value={this.state.selectedDate}
                    onChange={(date) => this.handleDateChange(date)}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              <TextField 
                fullWidth
                type="number" 
                name="amount" 
                id="outlined-basic" 
                label="Amount" 
                autoComplete="off"
                value={this.state.amount} 
                onChange={(e) => this.handleChange(e)} 
              />
              <TextField 
                fullWidth
                type="text" 
                name="comment" 
                id="outlined-basic" 
                label="Comment" 
                autoComplete="off"
                value={this.state.comment} 
                onChange={(e) => this.handleChange(e)} 
              />
              <br/>
              <TextField
                fullWidth
                id="categories"
                select
                label="Select category"
                name="categoryId"
                value={this.state.categoryId}
                onChange={(e) => this.handleChange(e)}
                style={this.props.type === "expenses" ? { display: 'block' } : { display: 'none' }}
              >
                {this.props.expensesCategories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {capitalize(cat.name)}
                  </MenuItem>
                ))}
              </TextField>
              <br style={this.props.type === "funds" ? { display: 'block' } : { display: 'none' }}/>
              <TextField
                fullWidth
                id="source"
                select
                label="Select Source"
                name="sourceId"
                value={this.state.sourceId}
                onChange={(e) => this.handleChange(e)}
                style={this.props.type === "funds" ? { display: 'block' } : { display: 'none' }}
              >
                {this.props.fundSources.map(src => (
                  <MenuItem key={src.id} value={src.id}>
                    {capitalize(src.source)}
                  </MenuItem>
                ))}
              </TextField>
              <br/>
              <TextField
                fullWidth
                id="account"
                select
                label="Select account"
                name="account"
                value={this.state.account || ''}
                onChange={(e) => this.handleChange(e)}
              >
                {this.props.userAccounts.map(acc => (
                  <MenuItem key={acc.id} value={acc}>
                    {capitalize(acc.account)} - {capitalize(acc.type)}
                  </MenuItem>
                ))}
              </TextField>
              <Box pl={1} pt={2} pb={1}>
                <div className={classes.root}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => this.addMore()}
                  >
                    Add More
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    // onClick={submitNew}
                  >
                    Send
                  </Button>
                </div>
              </Box> 
            </div>
          </Fade>
        </Modal>
      </div>
    );
  }
}

AddModal.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddModal);


// const useStyles = makeStyles(theme => ({
//   root: {
//     '& > *': {
//       margin: theme.spacing(1),
//     },
//   },
//   modal: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   paper: {
//     backgroundColor: theme.palette.background.paper,
//     border: '2px solid #000',
//     padding: theme.spacing(8, 8, 8),
//   },
// }));

// export default function AddModal(props) {
//   const classes = useStyles();
//   const [open, setOpen] = React.useState(false);

//   const handleOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   let [selectedDate, setSelectedDate] = React.useState(new Date());
//   let [amount, setAmount] = React.useState("");
//   let [comment, setComment] = React.useState("");
//   let [categoryId, setCategory] = React.useState("");
//   let [account, setAccount] = React.useState("");
//   let [sourceId, setSource] = React.useState("");

//   const handleDateChange = date => {
//     setSelectedDate(date);
//   };

//   const handleAmount = (event) => {
//     setAmount(decimals(Number(event.target.value)));
//   }

//   const handleComment = (event) => {
//     setComment(event.target.value);
//   }

//   const categoryChange = event => {
//     setCategory(event.target.value);
//   };

//   const sourceChange = event => {
//     setSource(event.target.value);
//   };

//   const accountChange = event => {
//     setAccount(event.target.value);
//   };

//   const itemsAdded = []

//   const addMore = () => {
//     var accountSelected = props.userAccounts.find(x => x.account === account);
//     if(props.type === "expenses"){
//       if(selectedDate && amount && accountSelected && categoryId){
//         itemsAdded.push({
//           date: moment(selectedDate).format('MM-DD-YYYY'),
//           amount: amount,
//           comment: comment || null, 
//           accountId: accountSelected.id,
//           categoryId: categoryId
//         })
//       }
//     } 
//     if (props.type === "funds") {
//       if (selectedDate && amount && accountSelected && sourceId) {
//         itemsAdded.push({
//           date: moment(selectedDate).format('MM-DD-YYYY'),
//           amount: amount,
//           comment: comment || null,
//           accountId: accountSelected.id,
//           typeId: accountSelected.typeId,
//           sourceId: sourceId
//         });
//       }
//     }
//     clearAfterSubmit();
//     console.log("+++ 109 AddModal.js itemsAdded: ", itemsAdded)
//   }

//   const submitNew = (event) => {
//     event.preventDefault();
//     if(!selectedDate || !amount || !account){
//       return;
//     }

//     var accountSelected = props.userAccounts.find(x => x.account === account);
//     var payload;
//     if (props.type === "expenses") {
//       if(!categoryId){
//         return;
//       } else {
//         payload = [{
//           date: moment(selectedDate).format('MM-DD-YYYY'),
//           amount: Number(amount),
//           comment: comment || null, 
//           accountId: accountSelected.id,
//           categoryId: categoryId
//         }];
//         post_expenses_bulk(payload)
//           .then((res) => {
//             var data = res.data;
//             if(data.success){
//               props.getExpenses();
//               props.getAllTotals()
//               clearAfterSubmit();
//               handleClose();
//               return;
//             }
//           })
//       }
//     }
//     if (props.type === "funds") {
//       if(!sourceId){
//         return;
//       } else {
//         payload = [{
//           date: moment(selectedDate).format('MM-DD-YYYY'),
//           amount: Number(amount),
//           comment: comment || null,
//           accountId: accountSelected.id,
//           typeId: accountSelected.typeId,
//           sourceId: sourceId
//         }];
//         post_funds_bulk(payload)
//           .then((res) => {
//             var data = res.data;
//             if(data.success){
//               // props.getFunds();
//               props.getAllTotals();
//               clearAfterSubmit();
//               handleClose();
//             }
//           })
//       }
//     }
//   }


//   const clearAfterSubmit = () => {
//     setSelectedDate(new Date());
//     setAmount(0);
//     setComment(" ");
//     setCategory("");
//     setSource("");
//     setAccount("");
//   }

//   return (
//     <div>
//       <AddCircleIcon onClick={handleOpen} />
//       <Modal
//         aria-labelledby="transition-modal-title"
//         aria-describedby="transition-modal-description"
//         className={classes.modal}
//         open={open}
//         onClose={handleClose}
//         closeAfterTransition
//         BackdropComponent={Backdrop}
//         BackdropProps={{
//         timeout: 500,
//         }}
//       >
//         <Fade in={open}>
//           <div className={classes.paper}>
//             <h2>Add {capitalize(props.type)}</h2>
//             <MuiPickersUtilsProvider utils={DateFnsUtils}>
//               <Grid container justify="space-around">
//                 <KeyboardDatePicker
//                   margin="normal"
//                   id="date-picker-dialog"
//                   label="Select Date of Transaction"
//                   format="MM-dd-yyyy"
//                   value={selectedDate}
//                   onChange={handleDateChange}
//                   KeyboardButtonProps={{
//                     'aria-label': 'change date',
//                   }}
//                 />
//               </Grid>
//             </MuiPickersUtilsProvider>
//             <TextField 
//               fullWidth
//               type="number" 
//               name="amount" 
//               id="outlined-basic" 
//               label="Amount" 
//               autoComplete="off"
//               onChange={handleAmount} value={props.amount} 
//             />
//             <br/>
//             <TextField 
//               fullWidth
//               type="text" 
//               name="comment" 
//               id="outlined-basic" 
//               label="Comment" 
//               autoComplete="off"
//               onChange={handleComment} value={props.comment} 
//             />
//             <br/>
//             <TextField
//               fullWidth
//               id="categories"
//               select
//               label="Select category"
//               value={categoryId}
//               onChange={categoryChange}
//               style={props.type === "expenses" ? { display: 'block' } : { display: 'none' }}
//             >
//               {props.expensesCategories.map(cat => (
//                 <MenuItem key={cat.id} value={cat.id}>
//                   {capitalize(cat.name)}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <br style={props.type === "funds" ? { display: 'block' } : { display: 'none' }}/>
//             <TextField
//               fullWidth
//               id="sources"
//               select
//               label="Select Source"
//               value={sourceId}
//               onChange={sourceChange}
//               style={props.type === "funds" ? { display: 'block' } : { display: 'none' }}
//             >
//               {props.fundSources.map(src => (
//                 <MenuItem key={src.id} value={src.id}>
//                   {capitalize(src.source)}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <br/>
//             <TextField
//               fullWidth
//               id="accounts"
//               select
//               label="Select account"
//               value={account}
//               onChange={accountChange}
//             >
//               {props.userAccounts.map(acc => (
//                 <MenuItem key={acc.id} value={acc.account}>
//                   {capitalize(acc.account)} - {capitalize(acc.type)}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <Box pl={1} pt={2} pb={1}>
//               <div className={classes.root}>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   className={classes.button}
//                   onClick={addMore}
//                 >
//                   Add More
//                 </Button>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   className={classes.button}
//                   onClick={submitNew}
//                 >
//                   Send
//                 </Button>
//               </div>
//             </Box> 
//           </div>
//         </Fade>
//       </Modal>
//     </div>
//   );
// }


