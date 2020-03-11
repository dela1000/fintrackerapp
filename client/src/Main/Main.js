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
      timeframe: 'year',
      currentTimeframe: 'month',
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


  getAllTotals (payload){
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
      this.setState({timeframe: "year", currentTimeframe: 'month'}, ()=> {
        this.updateListingData({timeframe: 'month'});
      });
    };
    if(timeframe === 'year' || timeframe === 'custom'){
      this.setState({timeframe: "month", currentTimeframe: 'year'}, ()=> {
        this.updateListingData({timeframe: 'year'});
      });
    };
  }


  updateListingData = (listingDataSelected) => {

    console.log("+++ 210 Main.js listingDataSelected: ", JSON.stringify(listingDataSelected, null, "\t"));
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
        }
        if(listingDataSelected.endDate){
          payload['endDate'] = listingDataSelected.endDate;
        }
        if(!payload['startDate'] && !payload['endDate']){
          payload['timeframe'] = "month";
        } else {
          this.setState({currentTimeframe: "custom"});
        }
      }
    }

    console.log("+++ 219 Main.js payload: ", JSON.stringify(payload, null, "\t"));
    console.log("+++ 220 Main.js this.state.listingDataSelected: ", this.state.listingDataSelected)

    search(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          if(data.message){
            this.setState({listingData: [], message: data.data.message})
            return;
          }
          console.log("+++ 253 Main.js data.data: ", JSON.stringify(data.data, null, "\t"));
          let finalData = data.data.results.sort((a, b) => moment(a.date) - moment(b.date))
          this.setState({listingData: finalData, listingDataSelected: listingDataSelected, totalExpenses: data.data.totalAmountFound}, ()=> {
            console.log("+++ 281 Main.js this.state.listingData: ", this.state.listingData)
          })
        } else {
          this.setState({listingData: [], message: data.data.message})
        }
      })

    // if(listingDataSelected && !listingDataSelected.startDate && !listingDataSelected.endDate){
    //   payload['timeframe'] = this.state.currentTimeframe;
    // }
    // if(listingDataSelected && listingDataSelected.startDate && listingDataSelected.endDate){
    //   payload['startDate'] = listingDataSelected.startDate;
    //   payload['endDate'] = listingDataSelected.endDate;
    //   if(this.state.listingDataSelected.type){
    //     payload['type'] = this.state.listingDataSelected.type;
    //   }
    //   if(this.state.listingDataSelected.categoryId){
    //     payload['categoryId'] = this.state.listingDataSelected.categoryId;
    //   }
    //   if(this.state.listingDataSelected.accountId){
    //     payload['accountId'] = this.state.listingDataSelected.accountId;
    //   }
    //   if(this.state.listingDataSelected.typeId){
    //     payload['typeId'] = this.state.listingDataSelected.typeId;
    //   }
    //   payload['timeframe'] = "custom";
    // }

    // if(listingDataSelected === null){
    //   payload['type'] = "expenses";
    // } else {
    //   if(listingDataSelected.type === 'expenses' || listingDataSelected.type === 'allExpenses'){
    //     payload['type'] = "expenses";
    //   }

    //   if(listingDataSelected.type === 'funds' || listingDataSelected.type === 'allFunds'){
    //     payload['type'] = "funds";
    //   }

    // }

    // if(payload.type === "expenses"){
    //   if(listingDataSelected && listingDataSelected.categoryId){
    //     payload['categoryId'] = Number(listingDataSelected.categoryId);
    //   }
    // }

    // if(payload.type === "funds"){
    //   if(listingDataSelected.accountId){
    //     payload['accountId'] = Number(listingDataSelected.accountId);
    //   }
    //   if(listingDataSelected.typeId){
    //     payload['typeId'] = Number(listingDataSelected.typeId);
    //   }
    // }
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
                      currentTimeframe={this.state.currentTimeframe}
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
