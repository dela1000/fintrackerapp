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
import { withStyles } from '@material-ui/core/styles';

import Logout from '../Auth/Logout.js';
import Settings from '../Settings/SettingsButton.js';

import SidePanel from './SidePanel/SidePanel.js';
import CenterPanel from './CenterPanel/CenterPanel.js';
import DetailsPanel from './DetailsPanel/DetailsPanel.js';

import { get_all_totals, expenses_totals, search } from "../Services/WebServices";

const drawerWidth = 300;

const styles = theme => ({
  root: {
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
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowY: 'scroll',
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
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
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
          console.log("+++ 155 Main.js data.data: ", data.data)
          this.setState({ 
            allTotals: data.data, 
            currentAvailable: data.data.currentAvailable, 
            totalExpenses: data.data.totalExpenses,
            expensesByCategory: data.data.expensesByCategory
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
          this.setState({timeframe: "custom"});
        }
      }
      if (this.state.listingDataSelected.name) {
        payload.name = this.state.listingDataSelected.name;
      }
      if(!payload.name && listingDataSelected.name){
        payload.name = listingDataSelected.name;
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

    console.log("+++ 219 Main.js payload: ", JSON.stringify(payload, null, "\t"));
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

          this.setState({listingData: finalData, listingDataSelected: payload, totalExpenses: data.data.totalAmountFound}, ()=> {
            console.log("+++ 281 Main.js this.state.listingData: ", this.state.listingData)
          })
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
    console.log("+++ 269 Main.js payload: ", payload)
    this.getAllTotals(payload);
    this.updateListingData({startDate: payload.startDate, endDate: payload.endDate})
  } 

  componentDidMount() {
    this.getAllTotals({timeframe: "month"});
    this.updateListingData({type: "expenses", timeframe: "month"});
  };

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
          classes={{
            paper: clsx(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
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
          />
        </Drawer>
        {/*END OF SIDE PANEL DRAWER */}
        {/*SECTIONS */}
        <div className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <GridList cols={1} >
              <GridListTile style={{height: '100%'}}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    {/*CENTER SECTION */}
                    <CenterPanel
                      timeframe={this.state.timeframe}
                      totalExpenses={this.state.totalExpenses}
                      currentAvailable={this.state.currentAvailable}
                      listingDataSelected={this.state.listingDataSelected}
                      listingData={this.state.listingData}
                      message={this.state.message}
                    />
                  </Grid>
                  <Grid item xs={4} className={classes.detailsPanel}>
                    <Paper className={classes.paper}>
                      {/*DETAILS SECTION */}
                      DETAILS GO HERE
                    </Paper>
                  </Grid>
                </Grid>
              </GridListTile>
            </GridList>
          </Container>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(Main);


