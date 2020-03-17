import { Constants } from 'expo';

import _ from 'lodash';

export const constants = () => {

    // To run on both, device and  emulator
    // urlBase = 'http://93.136.38.141:8080'
    // return { urlBase: urlBase }

    let isDevice = Constants.isDevice;
    let urlBase;
    // isDevice = true;
    if (!isDevice){
        // Daniel's machine API
        _.times(5, () => {
            console.log("++++++++++++++ constants.js LOCAL API ++++++++++++++")
        })
        urlBase = 'http://127.0.0.1:8080'
    } else {
        // AWS API
        _.times(5, () => {
            console.log("********************* constants.js AWS EC2 API *********************")
        })
        urlBase = 'http://52.33.150.215'
        
    }

    console.log("+++ 19 constants.js urlBase: ", urlBase)
    
    return { urlBase: urlBase }
}