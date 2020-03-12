import React from 'react';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Listing from './Listing.js'
import Sheet from './Sheet.js'

import { capitalize } from "../../Services/helpers.js";


const component = {
  Listing: Listing,
  Sheet: Sheet,
};

class SelectorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listButtonColor: 'primary',
      sheetButtonColor: 'default',
      viewSelected: "Listing",
      type: 'expenses'
    }
  }

  defineTitle = (listingDataSelected) => {
    console.log("+++ 32 SelectorPanel.js listingDataSelected: ", listingDataSelected)
    if(listingDataSelected){
      if(listingDataSelected.name){
        return capitalize(listingDataSelected.type) + " - " + capitalize(listingDataSelected.name)
      }
      if(listingDataSelected.type){
        if(listingDataSelected.type.toUpperCase().includes('expense'.toUpperCase())){
            return "Expenses";
        }
        if(listingDataSelected.type.toUpperCase().includes('fund'.toUpperCase())){
            return "Funds";
        }
      }
    } else{
      return "Expenses";
    };
  }

  updateView = (view) => {
    if(view === "Sheet"){
      this.setState({
        viewSelected: "Sheet",
        listButtonColor: 'default',
        sheetButtonColor: 'primary',
      })
    }
    if(view === "Listing") {
      this.setState({
        viewSelected: "Listing",
        listButtonColor: 'primary',
        sheetButtonColor: 'default',
      })
    }
  }

  render(){
    const { listingData, listingDataSelected, message } = this.props;
    const Cmp = component[this.state.viewSelected];
    return (
      <React.Fragment>
        <Grid 
          container 
          justify="space-between"
          alignItems="center"
          spacing={1}
        >
          <Grid item>
            <Typography align="left" variant="h5" style={message.length > 0 ? {} : {display: 'none'}}>
              {message}
            </Typography>
            <Typography align="left" variant="h5"  style={message.length > 0 ? {display: 'none'} : {}}>
              {this.defineTitle(listingDataSelected)}
            </Typography>
          </Grid>
          <Grid item>
            <Box mt={1} pl={1} pb={1}>
              <ButtonGroup>
                <Button 
                  size="small" 
                  variant="contained" 
                  color={this.state.listButtonColor} 
                  onClick={() => this.updateView('Listing')}>
                    List
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  color={this.state.sheetButtonColor} 
                  onClick={() => this.updateView('Sheet')}>
                    Sheet
                </Button>
              </ButtonGroup>
            </Box> 
          </Grid>
        </Grid>
        <Cmp 
          listingDataSelected={listingDataSelected}
          listingData={listingData}
          message={message}
        />
      </React.Fragment>
    );
  }
}

export default SelectorPanel;
