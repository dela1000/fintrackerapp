import axios from 'axios';


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