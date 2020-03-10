import _ from 'lodash';
import moment from 'moment';


export function capitalize(str) {
  if(str === 0 || str === "0.00"){
    return "0.00"
  }
  if(!str){
    return "";
  }
  return str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export function decimals(num) {
  if(!num) {
    return null
  }
  return Number(parseFloat(num).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 });
}

export function to2Fixed(n) {
  var s;
  if(isNaN(n)){
    s = "" + (Number(n));
   }else{
    s = "" + (+n);
   }
  var match = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);
  if (!match) { return 0; }
  var count = Math.max( 0, (match[1] === '0' ? 0 : (match[1] || '').length) - (match[2] || 0) );
  var value = s;
  if(count > 2){
    value = n.slice(0, -1)
  };
  var result = Number(value);
  return result;
}

export const dateFormat = 'MM-DD-YYYY';

export const formatDate = function (date) {
  return moment(date).format(dateFormat)
}

export function findMissingDates(data) {
  var tempResults = data.sort(function(a,b){
   return Date.parse(a.date) - Date.parse(b.date);
  }).reduce(function(hash){
    return function(p,c){
      var missingDaysNo = (Date.parse(c.date) - hash.prev) / (1000 * 3600 * 24);
      if(hash.prev && missingDaysNo > 1) {
        for(var i=1;i<missingDaysNo;i++)
          p.push(new Date(hash.prev+i*(1000 * 3600 * 24)));
      }
      hash.prev = Date.parse(c.date);
      return p;
    };
  }(Object.create(null)),[]);
  var results = [];
  _.forEach(tempResults, (date) => {
    results.push({
      date: moment(date).format(dateFormat),
      total: "0.00"
    })
  })
  return results;
}
