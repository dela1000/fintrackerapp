import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import InitialFunds from './InitialFunds';
import InitialItem from './InitialItem';
import AlertModal from './AlertModal';
import LocalStorageService from "../Services/LocalStorageService";
import { get_types, set_initials, fund_sources, categories_bulk } from '../Services/WebServices';
import { withRouter } from "react-router-dom";
import { dateFormat } from "../Services/helpers";

import Logout from '../Auth/Logout.js';

const localStorageService = LocalStorageService.getService();

class Initials extends React.Component {
  constructor(props) {
    super();
    this.state = {
      types: [],
      view: 1,
      errorFound: false,
      failMessage: '',
      categories: [],
      sources: [],
      rows: [{ 
        amount: '',
        account: '',
        typeId: 1,
        primary: true
      }],
    };
  }

  static propTypes = {
    types: PropTypes.array,
    categories: PropTypes.array,
    sources: PropTypes.array,
    rows: PropTypes.array,
    view: PropTypes.number
  }

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
      if (idx !== sidx) {
        return row
      };
      if(row.typeId !== 1){
        row.primary = false;
      }
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
          account: "",
          typeId: '',
          primary: false
        }])
    });
  };

  toSubmit = () => {
    this.props.history.push("/dashboard");
  }

  handleRemoveRow = idx => () => {
    if(this.state.rows.length > 1){
      this.setState({
        rows: this.state.rows.filter((s, sidx) => idx !== sidx)
      });
    }
  };

  handleSubmitFunds = evt => {
    evt.preventDefault();
    var primarySet = false;
    _.forEach(this.state.rows, (row) => {
      if(!row.typeId){
        if(!this.state.errorFound){
          this.setState({ errorFound: true, failMessage: "All accounts need a Type" })
        }
      }
      if(row.primary && !primarySet){
        primarySet = true;
      }
    })
    if(!primarySet){
      this.setState({ errorFound: true, failMessage: "A Checking Account needs to be set as Primary" })
    }
    var payload = [];
    _.forEach(this.state.rows, (row)=> {
      payload.push({
        amount: Number(row.amount),
        account: row.account,
        typeId: row.typeId,
        primary: row.primary,
        date: moment().format(dateFormat),
      })
    })
    set_initials(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.props.update_initials();
          this.props.history.push("/dashboard");
        } else {
          this.setState({ errorFound: true, failMessage: 'Something went really wrong' })
        }
      })
  }

  closeWarning = () => {
    this.setState({ errorFound: false, failMessage: '' })
  }


  handleCategory = idx => evt => {
    const item = this.state.categories.map((category, sidx) => {
      if (idx !== sidx) return category;
      return { ...category, name: evt.target.value };
    });

    this.setState({ categories: item });
  };

  handleAddCategory = () => {
    this.setState({
      categories: this.state.categories.concat([{  name: '' }])
    });
  };

  handleSources = idx => evt => {
    const item = this.state.sources.map((source, sidx) => {
      if (idx !== sidx) return source;
      return { ...source, name: evt.target.value };
    });

    this.setState({ sources: item });
  };

  handleAddSource = () => {
    this.setState({
      sources: this.state.sources.concat([{  name: '' }])
    });
  };


  submitCatsSours = evt => {
    let catHolder = [];
    let srcHolder = [];
    _.forEach(this.state.categories, (cat) => {
      cat.name = cat.name.trim();
      if(cat.name.length > 0){
        catHolder.push({
          name: cat.name
        })
      }
    })
    _.forEach(this.state.sources, (src) => {
      src.name = src.name.trim();
      if(src.name.length > 0){
        srcHolder.push({
          source: src.name 
        })
      }
    })
  
    if(srcHolder.length > 0 && catHolder.length > 0){
      console.log("+++ 207 Initials.js Submit Cats")
      categories_bulk(catHolder)
        .then((catRes) => {
          var catData = catRes.data;
          if(catData.success){
            console.log("+++ 212 Initials.js Submit Srcs")
            fund_sources(srcHolder)
              .then((srcRes) => {
                var srcData = srcRes.data;
                if(srcData.success){
                  this.changeView(3)
                }
              })
          } else {
            this.setState({ errorFound: true, failMessage: 'Something went really wrong' })
          }
        })
    } else {
      this.setState({ errorFound: true, failMessage: 'Add at least one Expense Category and one Fund Source' }, () => {
        setTimeout(() => {
          this.setState({ errorFound: false, failMessage: "" })
        }, 2500);
      })
    }
  }

  componentDidMount() {
    if(localStorageService.getInitial()){
      this.props.history.push("/dashboard");
    }
    this.getTypes();
    this.handleAddCategory();
    this.handleAddSource();
  };


  render() {
    if(this.state.view === 1){
      return (
        <React.Fragment>
          <Logout />
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '90vh' }}
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
        </React.Fragment>
      )
    }
    
    if(this.state.view === 2){
        return (
          <React.Fragment>
            <AlertModal 
              errorFound={this.state.errorFound} 
              closeWarning={this.closeWarning} 
              failMessage={this.state.failMessage}
            />
            <Logout />
            <Grid
              container
              spacing={5}
              alignItems="center"
              justify="center"
              style={{ minHeight: '80vh' }}
            >
              <Grid item xs={5}>
               <form onSubmit={this.handleSubmitCategories}>
                  <Box pt={5} pb={5}>
                    <Grid item xs>
                      <Typography component="h1" variant="h4" color="inherit" align="center">
                        Now, lets add Expenses categories,
                      </Typography>
                      <Typography component="h1" variant="h6" color="inherit" align="center">
                        Examples are Groceries, Dining out, Housing, Bills, Etc. Add as many as you like.
                      </Typography>
                    </Grid>
                  </Box>
                  <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                  >
                    {this.state.categories.map((item, index) => (
                      <InitialItem 
                        key={index} 
                        item={item}
                        index={index}
                        name='name'
                        label='category'
                        handleFunction={this.handleCategory}
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
                          style={{float:"right"}}
                          onClick={this.handleAddCategory}
                        >
                          Add More
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </form>
              </Grid>
              <Grid item xs={5}>
                <form onSubmit={this.handleSubmitSources}>
                  <Box pt={5} pb={5}>
                    <Grid item xs>
                      <Typography component="h1" variant="h4" color="inherit" align="center">
                        and Fund sources
                      </Typography>
                      <Typography component="h1" variant="h6" color="inherit" align="center">
                        The name of your employer, your business, any Freelance gigs, or even taxes. 
                      </Typography>
                    </Grid>
                  </Box>
                  <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                  >
                    {this.state.sources.map((item, index) => (
                      <InitialItem 
                        key={index} 
                        item={item}
                        index={index}
                        name='source'
                        label='source'
                        handleFunction={this.handleSources}
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
                          style={{float:"right"}}
                          onClick={this.handleAddSource}
                        >
                          Add More
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </form>
              </Grid>
            </Grid>
            <Grid 
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item xs>
                <Box mt={2} pt={2} mr={8} pr={8} pb={1}>
                  <Button 
                    variant="contained"
                    color="primary"
                    size="large"
                    style={{float:"right"}}
                    onClick={this.submitCatsSours}
                  >
                    Next
                  </Button>
                </Box> 
              </Grid>
            </Grid>
          </React.Fragment>
        )
    }

    if(this.state.view === 3){
    
      return (
        <React.Fragment>
          <AlertModal 
            errorFound={this.state.errorFound} 
            closeWarning={this.closeWarning} 
            failMessage={this.state.failMessage}
          />
          <Logout />
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
          >
            <form onSubmit={this.handleSubmitFunds}>
              <Grid item xs={12}>
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
                    <InitialFunds 
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
                        Done
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
export default withRouter(Initials);