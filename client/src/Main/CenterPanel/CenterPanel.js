import React from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { decimals } from "../../Services/helpers";

import ListingData from './ListingData.js';

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

export default function CenterPanel(props) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  let today = moment();
  let avgThisMonth = props.currentAvailable/today.format('D');
  let averageExpensesEstimate = avgThisMonth*moment().daysInMonth();
  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

