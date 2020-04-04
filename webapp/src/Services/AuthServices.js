import axios from 'axios';

export function login(payload){
  return axios.post(':8888/login', payload)
}

export function signup(payload){
  return axios.post(':8888/signup', payload)
}

export function logout(){
  return axios.get(':8888/logout')
}