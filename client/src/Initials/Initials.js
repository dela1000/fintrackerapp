import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import InitialItem from './InitialItem';
import AlertModal from './AlertModal';
import { get_types } from '../Services/WebServices';
import { capitalize, decimals } from '../Services/helpers';

class Initials extends React.Component {
  constructor() {
    super();
    this.state = {
      types: [],
      view: 2,
      typeIdMissing: false,
      failMessage: '',
      rows: [
        { 
          amount: '',
          name: '',
          typeId: '',
          primary: false
        },
      ]
    };
  }

  static propTypes = {
    types: PropTypes.array,
    rows: PropTypes.array,
    view: PropTypes.number
  }

  componentDidMount() {
    this.getTypes();
  };

  getTypes (){
    get_types()
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({ types: data.data })
        }
      })
  }

  changeView(pg){
    this.setState({view: pg})
  }


  handleChange = idx => evt => {
    const item = this.state.rows.map((row, sidx) => {
      if (idx !== sidx) return row;
      return { ...row, [evt.target.name]: evt.target.value };
    });

    this.setState({ rows: item });
  };

  handlePrimary = idx => evt => {
    const item = this.state.rows.map((row, sidx) => {
      if (idx !== sidx) return { ...row, primary: false };
      if(row.primary){
        return { ...row, primary: false };
      } else {
        return { ...row, primary: true };
      }
    })
    this.setState({ rows: item });
    
  }


  handleAddRow = () => {
    this.setState({
      rows: this.state.rows.concat([{ 
          amount: '',
          name: "",
          typeId: '',
          primary: false
        }])
    });
  };

  handleRemoveRow = idx => () => {
    if(this.state.rows.length > 1){
      this.setState({
        rows: this.state.rows.filter((s, sidx) => idx !== sidx)
      });
    }
  };

  handleSubmit = evt => {
    evt.preventDefault();
    
    _.forEach(this.state.rows, (row) => {
      if(!row.typeId){
        this.setState({ typeIdMissing: true, failMessage: "All accounts need a Type" })
      }
    })
  }

  closeWarning = () => {
    this.setState({ typeIdMissing: false })
  }

  render() {
    if(this.state.view === 1){
      return (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={10}>
            <Typography component="h1" variant="h4" color="inherit">
              Welcome to FinTracker!
            </Typography>
            <Typography component="h2" variant="h6" color="inherit">
              Here, we will add all the initial amounts for our current Checking, Savings, and Investment accounts.
            </Typography>
            <br/>
            <Button
              variant="contained"
              color="primary"
              style={{float:"right"}}
              onClick={() => this.changeView(2)}
            >
              Next
            </Button>
          </Grid>
        </Grid>
      )
    }
    if(this.state.view === 2){
    
      return (
        <React.Fragment>
          <AlertModal 
            typeIdMissing={this.state.typeIdMissing} 
            closeWarning={this.closeWarning} 
            failMessage={this.state.failMessage}
          />
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
          >
            <form onSubmit={this.handleSubmit}>
              <Grid item xs={10}>
                <Box pt={5} pb={5}>
                  <Grid item xs>
                    <Typography component="h1" variant="h6" color="inherit" align="center">
                      Add the Amount, Account Name and select the Account type below. Also, assign one Checking account as your primary account. 
                    </Typography>
                    <Typography component="h1" variant="h6" color="inherit" align="center">
                      You will need at least one Checking account set to Primary.
                    </Typography>
                  </Grid>
                </Box>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                >
                  {this.state.rows.map((item, index) => (
                    <InitialItem 
                      key={index} 
                      item={item} 
                      index={index} 
                      handleChange={this.handleChange} 
                      handlePrimary={this.handlePrimary} 
                      handleRemoveRow={this.handleRemoveRow} 
                      types={this.state.types}
                      rowsLength={this.state.rows.length}
                    />
                  ))}
                </Grid>
                <Box pt={10}>
                  <Grid
                    container
                    spacing={0}
                  >
                    <Grid item xs>
                      <Button 
                        variant="contained"
                        color="primary"
                        onClick={this.handleAddRow}
                      >
                        Add More
                      </Button>
                    </Grid>
                    <Grid item xs>
                      <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{float:"right"}}
                      >
                        Next
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </form>
          </Grid>
        </React.Fragment>
      );
    }
  }
}

export default Initials;