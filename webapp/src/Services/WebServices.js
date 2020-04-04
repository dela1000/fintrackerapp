import axios from 'axios';
import _ from 'lodash'

export function whoami(payload){
  return axios.get(':8888/whoami')
}

export function get_types(){
  return axios.get(':8888/types');
}

export function get_expenses(page){
  var pg = 1
  if(page){
    pg = page;
  }
  return axios.get(':8888/expenses_bulk?page=' + pg)
}

export function get_funds(page){
  var pg = 1
  if(page){
    pg = page;
  }
  return axios.get(':8888/funds_bulk?page=' + pg)
}

export function get_all_totals(payload){
  var link = ':8888/all_totals?'
  _.forEach(payload, (value, key) => {
    link = link + key + "=" + value + "&"
  })
  console.log("+++ 35 WebServices.js link: ", link)
  return axios.get(link);
}

export function expenses_totals(params) {
  var link = ':8888/expenses_totals?'
  if(params.timeframe){
    link = link + "timeframe=" + params.timeframe;
  }
  return axios.get(link);
}

export function all_user_data_types(){
  return axios.get(':8888/all_user_data_types')
}

export function post_expenses_bulk(payload){
  return axios.post(':8888/expenses_bulk', payload)
}

export function post_funds_bulk(payload){
  return axios.post(':8888/funds_bulk', payload)
}

export function set_initials(payload){
  return axios.post(':8888/set_initials', payload)
}

export function categories_bulk(payload){
  return axios.post(':8888/categories_bulk', payload)
}

export function user_accounts(payload){
  return axios.post(':8888/user_accounts', payload)
}

export function fund_sources(payload){
  return axios.post(':8888/fund_sources', payload)
}

export function transfers(payload){
  return axios.post(':8888/transfers', payload)
}

export function search(payload){
  var link = ':8888/search?';
  _.forEach(payload, (item, key) => {
    var param = key + '=' + item + '&';
    link = link + param
  })
  return axios.get(link)
}

export function patch_expenses(payload){
  return axios.patch(':8888/expenses', payload)
}

export function patch_funds(payload){
  return axios.patch(':8888/funds', payload)
}