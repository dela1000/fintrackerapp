import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import 'typeface-roboto';

ReactDOM.render(
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="xl">
        <App />
      </Container>
    </React.Fragment>,
    document.getElementById('root'));
