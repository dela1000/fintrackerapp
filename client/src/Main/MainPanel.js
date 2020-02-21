import React from 'react';
import clsx from 'clsx';
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
import ExpensesList from './ExpensesList.js';
import SidePanelItem from './SidePanelItem.js';
import AddModal from './AddModal.js';
import DetailsPanel from './DetailsPanel.js';
import Logout from '../Auth/Logout.js';

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
        <Grid container spacing={1} style={{"marginTop": "5px"}}>
          <Grid item xs={2} onClick={() => props.getExpenses()}>
            <Box pl={1} pt={0.5}>
              <ReceiptIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={open ? { display: 'block' } : { display: 'none' }} onClick={() => props.getExpenses()}>
            <Typography variant="h6">
              EXPENSES
            </Typography>
          </Grid>
          <Grid item xs={2} style={open ? { display: 'block', "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <AddModal 
            type={'expenses'}
            expensesCategories={props.expensesCategories}
            fundSources={props.fundSources}
            userAccounts={props.userAccounts}
            getAllTotals={props.getAllTotals}
            getExpenses={props.getExpenses}
            />
          </Grid>
        </Grid>
        {/*<Box pt={1} pr={2} pb={1} pl={2} style={open ? { display: 'block' } : { display: 'none' }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" align="left">
                Total Expenses
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align="right">
                {props.totalExpenses}
              </Typography>
            </Grid>
          </Grid>
        </Box>*/}
        <List style={open ? { display: 'block' } : { display: 'none' }}>
          {props.expensesByCategory.map((item, key) => (
            <ListItem button key={key} onClick={() => props.selectCategory(item)}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography align="left">
                    {capitalize(item.category)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right" style={item.amount < 0 ? {color: 'red'} : {} }>
                    {decimals(item.amount)}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Grid container spacing={1} style={{"marginTop": "5px"}}>
          <Grid item xs={2} onClick={() => props.getFunds()}>
            <Box pl={1} pt={0.5}>
              <AccountBalanceWalletIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={open ? { display: 'block' } : { display: 'none' }} onClick={() => props.getFunds()}>
            <Typography variant="h6">
              FUNDS
            </Typography>
          </Grid>
          <Grid item xs={2} style={open ? { display: 'block', "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <AddModal 
            type={'funds'}
            expensesCategories={props.expensesCategories}
            fundSources={props.fundSources}
            userAccounts={props.userAccounts}
            getAllTotals={props.getAllTotals}
            />
          </Grid>
        </Grid>
        <SidePanelItem
          data={props.availableByAccount.checking}
          open={open}
          type={'checking'}
          selectAccount={props.selectAccount}
          currentAvailable={props.currentAvailable}
        />
        <SidePanelItem
          data={props.availableByAccount.savings}
          open={open}
          type={'savings'}
          selectAccount={props.selectAccount}
        />
        <SidePanelItem
          data={props.availableByAccount.investments}
          open={open}
          type={'investments'}
          selectAccount={props.selectAccount}
        />
      </Drawer>
      <div className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>
          <GridList cols={1} >
            <GridListTile style={{height: '100%'}}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Grid container spacing={3}>
                      <Grid item xs={4}>
                        <Paper className={fixedHeightPaper}>
                          <Typography variant="h6">
                            Expenses This Month
                          </Typography>
                          <Typography component="p" variant="h5" color="textSecondary">
                            {props.totalExpenses}
                          </Typography>
                          <Typography variant="h6">
                            Current Available
                          </Typography>
                          <Typography component="p" variant="h5" color="textSecondary">
                            {props.currentAvailable}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={8}>
                        <Paper className={fixedHeightPaper}>
                        MORE DATA GOES HERE
                        </Paper>
                      </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper className={classes.paper}>
                        <ExpensesList 
                          expensesData={props.expensesData}
                          expensesByCategory={props.expensesByCategory}
                          totalExpenses={props.totalExpenses}
                          timeframe={props.timeframe}
                          selectCategory={props.selectCategory}
                          selectAccount={props.selectAccount}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <DetailsPanel 
                    expensesData={props.expensesByCategory}
                  />
                </Grid>
              </Grid>
            </GridListTile>
          </GridList>
        </Container>
      </div>
    </div>
  );
}