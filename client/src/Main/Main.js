import React from 'react';
import clsx from 'clsx';
import moment from 'moment';

import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Grid from '@material-ui/core/Grid';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import { withStyles } from '@material-ui/core/styles';

import Logout from '../Auth/Logout.js';
import Settings from '../Settings/SettingsButton.js';

import SidePanel from './SidePanel/SidePanel.js';
import CenterPanel from './CenterPanel/CenterPanel.js';
import DetailsPanel from './DetailsPanel/DetailsPanel.js';
import EditDrawer from './EditDrawer/EditDrawer.js';

import { to2Fixed } from "../Services/helpers";
import { get_all_totals, expenses_totals, patch_expenses, patch_funds, search } from "../Services/WebServices";
import { defineColors } from "../Services/Colors.js";

const drawerWidth = 300;

const styles = theme => ({
  root: {
    height: '100vh',
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - 300px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    height: '100vh',
    overflowY: 'scroll',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    width: '100%',
    flexGrow: 1,
    height: 'auto',
    overflow: 'auto',
  },
  container: {
    overflowY: 'scroll',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  detailsPanel: {
    overflowY: 'scroll',
    height: '100%',
    display: 'block'
  },
  fixedHeight: {
    height: 160,
  },
  depositContext: {
    flex: 1,
  },
  list: {
      width: 450,
    },
    fullList: {
      width: 'auto',
    },
})

class Main extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      open: true,
      totalExpenses: 0,
      currentAvailable: 0,
      expensesByCategory: [],
      listingData: [],
      timeframe: 'month',
      page: 1,
      listingDataSelected: {
        "type": "expenses"
      },
      allTotals: {
        currentAvailable: 0,
        availableByAccount: {
          checking: [],
          savings: [],
          investments: [],
        },
        fundsByTypes: [],
        userAccounts: [],
        expensesCategories: [],
        fundSources: [],
      },
      message: "",
      customOption: "",
      detailsState: 'close',
      centerWidth: 8,
      detailsWidth: true,
      right: false,
      dataToEdit: {},
      colors: [],
    };
  }

  handleDrawer(value) {
    this.setState({ open: value });
  };

  getAllTotals = (payload) => {
    get_all_totals(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({ 
            allTotals: data.data, 
            currentAvailable: data.data.currentAvailable, 
            totalExpenses: data.data.totalExpenses,
            expensesByCategory: data.data.expensesByCategory
          }, () => {
            let colors = defineColors(this.state.allTotals.expensesCategories);
            this.setState({colors})
          })
        }
      })
  }

  getExpensesTotals (payload){
    expenses_totals(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({
            totalExpenses: data.data.totalExpenses,
            expensesByCategory: data.data.expensesByCategory
          })
        }
      })
  }

  updateTimeframe = (timeframe) => {
    if(timeframe === 'month'){
      this.setState({timeframe: "year"}, ()=> {
        this.updateListingData({timeframe: 'year'});
      });
    };
    if(timeframe === 'year' || timeframe === 'custom'){
      this.setState({timeframe: "month"}, ()=> {
        this.updateListingData({timeframe: 'month'});
      });
    };
  }


  updateListingData = (listingDataSelected) => {
    var payload = {
      page: this.state.page,
    }
    if(!listingDataSelected){
      payload['type'] = "expenses";
    } else {
      if(listingDataSelected.type){
        payload['type'] = listingDataSelected.type;
        if(listingDataSelected.timeframe){
          this.setState({timeframe: listingDataSelected.timeframe});
        }
      } else {
        if(this.state.listingDataSelected.type){
          payload['type'] = this.state.listingDataSelected.type;
        } else {
          payload['type'] = 'expenses';
        }
      }
      if(listingDataSelected.timeframe){
        payload['timeframe'] = listingDataSelected.timeframe;
      } else {
        if(listingDataSelected.startDate){
          payload['startDate'] = listingDataSelected.startDate;
        } else if(this.state.listingDataSelected.startDate){
          payload['startDate'] = this.state.listingDataSelected.startDate
        }
        if(listingDataSelected.endDate){
          payload['endDate'] = listingDataSelected.endDate;
        } else if(this.state.listingDataSelected.endDate){
          payload['endDate'] = this.state.listingDataSelected.endDate;
        }
        if(!payload['startDate'] && !payload['endDate']){
          payload['timeframe'] = this.state.timeframe;
        } else {
          if(listingDataSelected.timeframe){
            this.setState({timeframe: listingDataSelected.timeframe});
          } else {
            this.setState({timeframe: "custom"});
          }
        }
      }
      if (this.state.listingDataSelected.name) {
        payload.name = this.state.listingDataSelected.name;
      }
      if(!payload.name && listingDataSelected.name){
        payload.name = listingDataSelected.name;
      }
      if(listingDataSelected.customOption){
        this.setState({customOption: listingDataSelected.customOption})
      } else if(this.state.listingDataSelected.customOption){
        this.setState({customOption: this.state.listingDataSelected.customOption})
      }
    }

    if(listingDataSelected){
      if(payload.type === "expenses"){
        if(listingDataSelected.categoryId){
          payload['categoryId'] = Number(listingDataSelected.categoryId);
        } else if(this.state.listingDataSelected.categoryId){
          payload['categoryId'] = Number(this.state.listingDataSelected.categoryId);
        }
      }
      if(payload.type === "funds"){
        if(listingDataSelected.accountId){
          payload['accountId'] = Number(listingDataSelected.accountId);
        } else if(this.state.listingDataSelected.accountId){
          payload['accountId'] = Number(this.state.listingDataSelected.accountId);
        }
        if(listingDataSelected.typeId){
          payload['typeId'] = Number(listingDataSelected.typeId);
        } else if(this.state.listingDataSelected.typeId){
          payload['typeId'] = Number(this.state.listingDataSelected.typeId);
        }
      }
      
      if(payload.type === "allExpenses" || payload.type === "allFunds"){
        this.setState({customOption: "", timeframe: 'month'})
        if(payload.type === "allExpenses"){
          payload = {
            type: "expenses",
          }
        }
        if(payload.type === "allFunds"){
          payload = {
            type: "funds",
          }
        }
        if(listingDataSelected.timeframe){
          payload.timeframe = listingDataSelected.timeframe;
        } else if (this.state.listingDataSelected.timeframe){
          payload.timeframe = this.state.listingDataSelected.timeframe;
        } else {
          payload.timeframe = "month";
        }
      }
      // TYPES ARE NOT WORKING
      // if(payload.type === "type"){
      //   if(listingDataSelected.typeId){
      //     payload['typeId'] = Number(listingDataSelected.typeId);
      //   }
      //   if(this.state.listingDataSelected.typeId){
      //     payload['typeId'] = Number(this.state.listingDataSelected.typeId);
      //   }
      // }
    }

    search(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          if(data.message){
            this.setState({listingData: [], message: data.data.message}, () => {
              setTimeout(() => {
                this.setState({message: ""})
              }, 2500);
            })
            return;
          }
          let finalData = data.data.results.sort((a, b) => moment(a.date) - moment(b.date))
          
          if(listingDataSelected && listingDataSelected.name){
            payload.name = listingDataSelected.name;
          }

          this.setState({listingData: finalData, listingDataSelected: payload, totalExpenses: data.data.totalAmountFound})
        } else {
          this.setState({listingData: [], message: data.data.message}, () => {
              setTimeout(() => {
                this.setState({message: ""})
              }, 2500);
            })
        }
      })
  }

  updateCustom = (payload) => {
    if(payload === "reset"){
      this.getAllTotals({timeframe: "month"});
      this.updateListingData({type: "allExpenses", timeframe: "month"});
      this.setState({customOption: ""})
    } else {
      this.getAllTotals(payload);
      this.updateListingData(payload);
    }
  } 

  componentDidMount() {
    this.getAllTotals({timeframe: "month"});
    this.updateListingData({type: "allExpenses", timeframe: "month"});
  };

  detailsView = () => {
    if(this.state.detailsState === 'open'){
      this.setState({ centerWidth: 8, detailsWidth: true, detailsState: 'close' })
    } else {
      this.setState({ centerWidth: 12, detailsWidth: false, detailsState: 'open' })
    }
  }

  toggleDrawer = (open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.setState({ right: open });
    if(!open){
      this.setState({dataToEdit: {}})
    }
  };

  openDetailsDrawer = (payload) => {
    console.log("+++ 389 Main.js payload.item: ", payload.item)
    let dataToEdit = {
      type: payload.type,
      id: payload.item.id,
      date: payload.item.date,
      amount: Number(payload.item.amount),
      comment: payload.item.comment,
      account: this.state.allTotals.userAccounts.find(x => x.id === payload.item.accountId),
      category: this.state.allTotals.expensesCategories.find(x => x.id === payload.item.categoryId),
      source: this.state.allTotals.fundSources.find(x => x.id === payload.item.sourceId),
    };
    this.setState({ right: true, dataToEdit});
  };

  handleEditDateChange = (e) => {
    let date = moment(e).format('MM-DD-YYYY');
    let dataToEdit = {...this.state.dataToEdit}
    dataToEdit.date = date;
    this.setState({dataToEdit});
  };

  handleEditChange = (e) => {
    let value = e.target.value;
      if(e.target.name === 'amount'){
        value = to2Fixed(e.target.value)
      }
    let dataToEdit = {...this.state.dataToEdit}
    dataToEdit[e.target.name] = value;
    this.setState({dataToEdit})
  }

  submitEdit = () => {
    let dataToEdit = {...this.state.dataToEdit}
    let payload = {
      id: dataToEdit.id,
      date: dataToEdit.date,
      amount: Number(dataToEdit.amount),
      accountId: dataToEdit.account.id,
      comment: dataToEdit.comment,
    };
    if(dataToEdit.type === "expenses"){
      payload.categoryId = dataToEdit.category.id;

      patch_expenses(payload)
        .then((res) => {
          var data = res.data;
          if(data.success){
            this.setState({ right: false, dataToEdit: {}}, () => {
              this.getAllTotals(this.state.listingDataSelected);
              this.updateListingData(this.state.listingDataSelected);
            });
          }
        })
    }
    if(dataToEdit.type === "funds"){
      payload.sourceId = dataToEdit.source.id;
      payload.typeId = dataToEdit.account.typeId;
      console.log("+++ 446 Main.js payload: ", JSON.stringify(payload, null, "\t"));
      patch_funds(payload)
        .then((res) => {
          var data = res.data;
          if(data.success){
            this.setState({ right: false, dataToEdit: {}}, () => {
              this.getAllTotals(this.state.listingDataSelected);
              this.updateListingData(this.state.listingDataSelected);
            });
          }
        })
    }
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        {/*HEADER BAR */}
        <AppBar position="fixed" className={clsx(classes.appBar, this.state.open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => this.handleDrawer(true)}
              className={clsx(classes.menuButton, this.state.open && classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
              FinTracker
            </Typography>
            <Settings />
            <Logout />
          </Toolbar>
        </AppBar>
        {/*SIDE PANEL DRAWER */}
        <Drawer
          variant="permanent"
          classes={{ paper: clsx(classes.drawerPaper, !this.state.open && classes.drawerPaperClose) }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={() => this.handleDrawer(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <SidePanel
            open={this.state.open}
            timeframe={this.state.timeframe}

            updateTimeframe={this.updateTimeframe}
            updateCustom={this.updateCustom}
            getAllTotals={this.getAllTotals}
            updateListingData={this.updateListingData}

            currentAvailable={this.state.currentAvailable}
            expensesByCategory={this.state.expensesByCategory} 

            expensesCategories={this.state.allTotals.expensesCategories}
            availableByAccount={this.state.allTotals.availableByAccount}
            fundSources={this.state.allTotals.fundSources}
            userAccounts={this.state.allTotals.userAccounts}
            colors={this.state.colors}
          />
        </Drawer>
        {/*END OF SIDE PANEL DRAWER */}
        {/*SECTIONS */}
        <div className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <GridList cols={1} >
              <GridListTile style={{height: '100%'}}>
                <Box>
                  <Button size="small" color="primary" style={{position: 'fixed', right: '24px', top: '73'}} onClick={this.detailsView}>
                    {this.state.detailsState}
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={this.state.centerWidth}>
                    {/*CENTER SECTION */}
                    <CenterPanel
                      timeframe={this.state.timeframe}
                      totalExpenses={this.state.totalExpenses}
                      currentAvailable={this.state.currentAvailable}
                      listingDataSelected={this.state.listingDataSelected}
                      listingData={this.state.listingData}
                      userAccounts={this.state.allTotals.userAccounts}
                      message={this.state.message}
                      customOption={this.state.customOption}
                      availableByAccount={this.state.allTotals.availableByAccount}
                      openDetailsDrawer={this.openDetailsDrawer}
                      colors={this.state.colors}
                    />
                  </Grid>
                  <Grid 
                    item 
                    xs={this.state.detailsWidth} 
                    className={classes.detailsPanel} 
                    style={ this.state.detailsWidth ? {} : {display: 'none'}} 
                  >
                    <Paper className={classes.paper}>
                      {/*DETAILS SECTION */}
                      <DetailsPanel 
                        viewSelected={this.state.listingDataSelected}
                        graphData={this.state.listingData}
                        timeframe={this.state.timeframe}
                        customOption={this.state.customOption}
                        colors={this.state.colors}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </GridListTile>
            </GridList>
          </Container>
        </div>
        <EditDrawer
          right={this.state.right}
          toggleDrawer={this.toggleDrawer}
          dataToEdit={this.state.dataToEdit}
          expensesCategories={this.state.allTotals.expensesCategories}
          fundSources={this.state.allTotals.fundSources}
          userAccounts={this.state.allTotals.userAccounts}
          handleEditDateChange={this.handleEditDateChange}
          handleEditChange={this.handleEditChange}
          submitEdit={this.submitEdit}
        />
      </div>
    )
  }
}

export default withStyles(styles)(Main);


