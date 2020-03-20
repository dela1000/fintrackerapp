import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import PersonOutlineTwoToneIcon from '@material-ui/icons/PersonOutlineTwoTone';
import { withRouter } from "react-router-dom";


const SettingsButton =(props) => {


  return (
    <IconButton>
      <PersonOutlineTwoToneIcon />
    </IconButton>
    
  );
}

export default withRouter(SettingsButton);