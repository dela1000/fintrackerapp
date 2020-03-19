import * as Device from 'expo-device';

import _ from 'lodash';

export const constants = () => {

  // To run on both, device and  emulator
  // urlBase = 'http://93.136.38.141:8080'
  // return { urlBase: urlBase }

  let isDevice = Device.isDevice;
  let urlBase;

  // isDevice = true;
  if (isDevice) {
    // Daniel's machine API
    _.times(5, () => {
      console.log("++++++++++++++ constants.js LOCAL API ++++++++++++++")
    })
    urlBase = 'http://127.0.0.1:8888'
  } else {
    // AWS API
    _.times(5, () => {
      console.log("********************* constants.js AWS EC2 API *********************")
    })
    urlBase = 'http://54.187.74.227'

  }

  console.log("+++ 19 constants.js urlBase: ", urlBase)

  return { urlBase: urlBase }
}