import React from 'react';
import clsx from 'clsx';

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

import { search } from "../Services/WebServices";

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
      timeframe: 'year',
      currentTimeframe: 'month',
      totalExpenses: 0,
      currentAvailable: 0,
      listingData: [],
      page: 1,
      listingDataSelected: {
        "type": "expenses"
      },
      message: "",

    };
    this.updateTimeframe = this.updateTimeframe.bind(this);
    this.updateCurrentAvailable = this.updateCurrentAvailable.bind(this);
    this.updateTotalExpenses = this.updateTotalExpenses.bind(this);
    this.updateListingData = this.updateListingData.bind(this);
  }

  handleDrawer(value) {
    this.setState({ open: value });
  };

  updateTimeframe(timeframe) {
    if(timeframe === 'month'){
      this.setState({timeframe: "year", currentTimeframe: 'month'}, () => {
        this.updateListingData(this.state.listingDataSelected)
      })
    }
    if(timeframe === 'year'){
      this.setState({timeframe: "month", currentTimeframe: 'year'}, () => {
        this.updateListingData(this.state.listingDataSelected)
      })
    }
  }

  updateCurrentAvailable (currentAvailable) {
    this.setState({currentAvailable})
  }

  updateTotalExpenses (totalExpenses) {
    this.setState({totalExpenses})
  }

  updateListingData (listingDataSelected) {
    var payload = {
      page: this.state.page,
      timeframe: this.state.currentTimeframe,
    }

    if(listingDataSelected === null){
      payload['type'] = "expenses";
    } else {
      if(listingDataSelected.type === 'expenses' || listingDataSelected.type === 'allExpenses'){
        payload['type'] = "expenses";
      }

      if(listingDataSelected.type === 'funds' || listingDataSelected.type === 'allFunds'){
        payload['type'] = "funds";
      }

    }

    if(payload.type === "expenses"){
      if(listingDataSelected && listingDataSelected.categoryId){
        payload['categoryId'] = Number(listingDataSelected.categoryId);
      }
    }

    if(payload.type === "funds"){
      if(listingDataSelected.accountId){
        payload['accountId'] = Number(listingDataSelected.accountId);
      }
      if(listingDataSelected.typeId){
        payload['typeId'] = Number(listingDataSelected.typeId);
      }
    }

    if(listingDataSelected && listingDataSelected.type === "allFunds"){
      payload['typeId'] = [1,2,3];
    }

    search(payload)
      .then((res) => {
        var data = res.data;
        if(data.success){
          if(data.message){
            this.setState({listingData: [], message: data.data.message})
            return
          }
          var searchData = listingDataSelected
          if(!listingDataSelected){
            searchData = {
              "type": "expenses"
            }
          }
          this.setState({listingData: data.data.results, listingDataSelected: searchData})
        } else {
          console.log("+++ 225 Main.js Here")
          this.setState({listingData: [], message: data.data.message})
        }
      })
  }
xr
  render () {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
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
            currentTimeframe={this.state.currentTimeframe}
            updateTimeframe={this.updateTimeframe}
            updateCurrentAvailable={this.updateCurrentAvailable}
            updateTotalExpenses={this.updateTotalExpenses}
            updateListingData={this.updateListingData}
          />
        </Drawer>
        <div className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <GridList cols={1} >
              <GridListTile style={{height: '100%'}}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <CenterPanel 
                    currentTimeframe={this.state.currentTimeframe}
                    currentAvailable={this.state.currentAvailable}
                    totalExpenses={this.state.totalExpenses}
                    listingData={this.state.listingData}
                    listingDataSelected={this.state.listingDataSelected}
                    message={this.state.message}
                    />
                  </Grid>
                  <Grid item xs={4} className={classes.detailsPanel}>
                    <Paper className={classes.paper}>
                      <DetailsPanel 
                        viewSelected={this.state.listingDataSelected}
                        graphData={this.state.listingData}
                        currentTimeframe={this.state.currentTimeframe}
                      />
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
