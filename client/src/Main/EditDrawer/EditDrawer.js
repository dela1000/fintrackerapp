import React from 'react';

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
  list: {
      width: 450,
    },
    fullList: {
      width: 'auto',
    },
})

class EditDraw extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      right: true
    };
  }

  toggleDrawer = (open) => event => {
    console.log("+++ 43 EditDrawer.js open: ", open)
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.toggleDrawer(open);
  };

  render () {
    const { classes, right, toggleDrawer } = this.props;
    const sideList = () => (
      <div
        className={classes.list}
        role="presentation"
        onClick={this.toggleDrawer(false)}
        onKeyDown={this.toggleDrawer(false)}
      >
        EDIT SECTION
      </div>
    );
    return (
      <SwipeableDrawer
        anchor="right"
        open={right}
        onClose={this.toggleDrawer(false)}
        onOpen={this.toggleDrawer(true)}
      >
        {sideList()}
      </SwipeableDrawer>
    )
  }
}


export default withStyles(styles)(EditDraw);