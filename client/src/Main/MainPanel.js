import React from 'react';
import clsx from 'clsx';
import moment from 'moment';
import _ from 'lodash'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
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
import ReceiptIcon from '@material-ui/icons/Receipt';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ListItem from '@material-ui/core/ListItem';
import { capitalize, decimals } from "../Services/helpers";
import SidePanel from './SidePanel/SidePanel.js';
import ListingData from './ListingData.js';
import DetailsPanel from './DetailsPanel.js';
import Logout from '../Auth/Logout.js';
import PersonOutlineTwoToneIcon from '@material-ui/icons/PersonOutlineTwoTone';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
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
    width: `calc(100% - 240px)`,
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
    height: '100vh',
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
  fixedHeight: {
    height: 160,
  },
  depositContext: {
    flex: 1,
  },
}));


export default function Dashboard(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  let today = moment();
  let avgThisMonth = props.currentAvailable/today.format('D');
  let averageExpensesEstimate = avgThisMonth*moment().daysInMonth();
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            FinTracker
          </Typography>
          <PersonOutlineTwoToneIcon />
          <Logout />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <SidePanel 
          open={open}
          currentAvailable={props.currentAvailable}
          expensesCategories={props.expensesCategories}
          fundSources={props.fundSources}
          userAccounts={props.userAccounts}
          getAllTotals={props.getAllTotals}
          getExpenses={props.getExpenses}
          availableByAccount={props.availableByAccount}
          getFunds={props.getFunds}
          getExpenses={props.getExpenses}
          expensesByCategory={props.expensesByCategory}
        />
      </Drawer>
      <div className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>
          <GridList cols={1} >
            <GridListTile style={{height: '100%'}}>
              <Grid container spacing={3}>
                {/*<Grid item xs={8}>
                  <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Paper className={fixedHeightPaper} style={{backgroundColor: "#FF504C"}}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">
                                Expenses This {props.timeframe}
                              </Typography>
                              <Typography component="p" variant="h4">
                                {props.totalExpenses}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">
                                Average Daily Expenses
                              </Typography>
                              <Typography component="p" variant="h6" style={ isNaN(avgThisMonth) ? {display: "none"} : {display: "block"}}>
                                {decimals(avgThisMonth)}
                              </Typography>
                              <Typography color="textSecondary">
                                Monthly Expenses Estimate
                              </Typography>
                              <Typography component="p" variant="h6" style={ isNaN(averageExpensesEstimate) ? {display: "none"} : {display: "block"}}>
                                {decimals(averageExpensesEstimate)}
                              </Typography>
                              
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper className={fixedHeightPaper} style={{backgroundColor: "#C6E0B4"}}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">
                                Current Available
                              </Typography>
                              <Typography component="p" variant="h4">
                                {props.currentAvailable}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              stuff
                              {props.viewSelected} - here
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper className={classes.paper}>
                        <ListingData 
                          viewSelected={props.viewSelected}
                          listingData={props.tableData}
                          timeframe={props.timeframe}
                          selectCategory={props.selectCategory}
                          selectAccount={props.selectAccount}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Paper className={classes.paper}>
                    <DetailsPanel viewSelected={props.viewSelected} expensesByCategory={props.expensesByCategory} availableByAccount={props.availableByAccount} />
                  </Paper>
                </Grid>*/}
              </Grid>
            </GridListTile>
          </GridList>
        </Container>
      </div>
    </div>
  );
}