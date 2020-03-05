import axios from 'axios';

export function whoami(payload){
  return axios.get('/whoami')
}


export function get_types(){
  return axios.get('/types');
}

export function get_expenses(page){
  var pg = 1
  if(page){
    pg = page;
  }
  return axios.get('/expenses_bulk?page=' + pg)
}

export function get_funds(page){
  var pg = 1
  if(page){
    pg = page;
  }
  return axios.get('/funds_bulk?page=' + pg)
}

export function get_all_totals(page){
  return axios.get('/all_totals');
}

export function all_user_data_types(){
  return axios.get('/all_user_data_types')
}

export function post_expenses_bulk(payload){
  return axios.post('/expenses_bulk', payload)
}

export function post_funds_bulk(payload){
  return axios.post('/funds_bulk', payload)
}

export function set_initials(payload){
  return axios.post('/set_initials', payload)
}

export function categories_bulk(payload){
  return axios.post('/categories_bulk', payload)
}

export function user_accounts(payload){
  return axios.post('/user_accounts', payload)
}

export function fund_sources(payload){
  return axios.post('/fund_sources', payload)
}

