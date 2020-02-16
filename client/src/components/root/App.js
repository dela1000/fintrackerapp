import React from 'react';
import logo from '../../logo.svg';
import './App.css';
import Login from '../login/Login.js';
import axios from 'axios'

class App extends React.Component {
  static propTypes = {
    // fishes: PropTypes.object,
    // updateFish: PropTypes.func,
    // deleteFish: PropTypes.func,
    // loadSampleFishes: PropTypes.func
  };

  state = {
    uid: null,
    owner: null
  };

  componentDidMount() {
    console.log("+++ 20 App.js MOUNTED")
  }

  // authHandler = async authData => {
  //   // 1 .Look up the current store in the firebase database
  //   const store = await base.fetch(this.props.storeId, { context: this });
  //   console.log(store);
  //   // 2. Claim it if there is no owner
  //   if (!store.owner) {
  //     // save it as our own
  //     await base.post(`${this.props.storeId}/owner`, {
  //       data: authData.user.uid
  //     });
  //   }
  //   // 3. Set the state of the inventory component to reflect the current user
  //   this.setState({
  //     uid: authData.user.uid,
  //     owner: store.owner || authData.user.uid
  //   });
  // };

  authenticate = data => {
    
    axios.post('/login', data)
      .then(function (response) {
        console.log("response.data: ", JSON.stringify(response.data, null, "\t"));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // logout = async () => {
  //   console.log("Logging out!");
  // };

  render() {
    const logout = <button onClick={this.logout}>Log Out!</button>;

    // 1. Check if they are logged in
    return <Login authenticate={this.authenticate}/>;

  //   // 2. check if they are not the owner of the store
  //   if (this.state.uid !== this.state.owner) {
  //     return (
  //       <div>
  //         <p>Sorry you are not the owner!</p>
  //         {logout}
  //       </div>
  //     );
  //   }

  //   // 3. They must be the owner, just render the inventory
  //   return (
  //     <div className="inventory">
  //       <h2>Inventory</h2>
  //       {logout}
  //       {Object.keys(this.props.fishes).map(key => (
  //         <EditFishForm
  //           key={key}
  //           index={key}
  //           fish={this.props.fishes[key]}
  //           updateFish={this.props.updateFish}
  //           deleteFish={this.props.deleteFish}
  //         />
  //       ))}
  //       <AddFishForm addFish={this.props.addFish} />
  //       <button onClick={this.props.loadSampleFishes}>
  //         Load Sample Fishes
  //       </button>
  //     </div>
  //   );
  }
}

export default App;
