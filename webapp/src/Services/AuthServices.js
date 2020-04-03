import axios from 'axios';

export function login(payload){
  return axios.post('/login', payload)
}

export function signup(payload){
  return axios.post('/signup', payload)
}

export function logout(){
  return axios.get('/logout')
}