import React, { Component } from 'react';
import { StyleSheet, View, Modal, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';

// import BeerLogo from '../appComponents/BeerLogo'

export default class Home extends React.Component {
  
  render() {
    return (
      <Modal
        transparent={true}
        animationType={'none'}
        visible={this.props.loading}
        onRequestClose={() => {console.log('close loading modal')}}>
        <View style={styles.modalBackground}>
          <View style={styles.beerBounceHolder}>
            <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" >
              <ActivityIndicator size="large" color="gray" />
            </Animatable.View>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  beerBounceHolder: {
    height: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
});
