import moment from 'moment';

export function capitalize(str) {
  if(!str){
    return "";
  }
  return str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export function decimals(num) {
  return Number(parseFloat(num).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 });
}

export function to2Fixed(n) {
  var s;
  if(isNaN(n)){
    s = "" + (+Number(n));
   }else{
    s = "" + (+n);
   }
  var match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
  if (!match) { return 0; }
  var count = Math.max( 0, (match[1] == '0' ? 0 : (match[1] || '').length) - (match[2] || 0) );
  var value = s;
  if(count > 1){
    value = Number(n);
    value = value.toFixed(2);
  };
  return value;
}

export const dateFormat = 'MM-DD-YYYY';

export const formatDate = function (date) {
  return moment(date).format(dateFormat)
}