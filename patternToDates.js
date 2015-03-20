var fs = require('fs');
var outputFilename = 'dates.txt';


// Process arguments:  pattern file, [start date].
if(process.argv.length < 3)  ex('need a pattern file as 1st argument.');
var filename = process.argv[2];

if(process.argv.length ==4){
  var startDate = new Date(process.argv[3]);
  if(!isValidDate(startDate))  ex('invalid start date as 2nd argument.');
}


// Read in, process, write out.
fs.readFile(filename, {encoding: 'ascii'}, function fileReadDone(err, data){
  if(err) ex('can\'t read pattern file.');

  data = arrayify(data);
  data = buildDates(data);

  fs.writeFile(outputFilename, data, function fileWriteDone(err){
    if(err) ex('can\'t write output to %s.', outputFilename);
  });

  console.log('OK: Written to %s.', outputFilename);
});



function ex(msg){
  console.error('Error: ' + msg);
  process.exit(1);
}


function isValidDate(d) {
  if(Object.prototype.toString.call(d) !== "[object Date]")  return false;
  return !isNaN(d.getTime());
}


// Convert pattern file contents to 2D array.
function arrayify(data){
  a = data.replace(/\r/g, '').split('\n');
  if(a[a.length - 1] == '')  a.pop();  //Remove possible last empty line.
  if(a.length != 7)  ex('the pattern file should have exactly 7 lines.')

  var len = a[0].length; //All rows should have equal length.
  a = a.map(function lineToCells(str){
    if(str.length != len)  ex('all lines in the pattern file should have equal length. (Stuff with spaces).');
    return str.split('');
  });

  return a;
}



function getLatestSaturday(){
  var d = new Date(),
      dayWkd = d.getDay(),
      day00  = d.getDate() + (dayWkd < 6?  -1 - dayWkd:  0);
  return new Date(d.setDate(day00));
}


function dateOffSet(date, addDays){
  var d = new Date(date);  //Make copy so setDate() doesn't modify argument "date"'s content.
  d.setDate(d.getDate() + addDays);
  return d;
}


// Convert the pattern's tiles to dates.
// For more intense color, add multiple lines for the same day but with a different time.
function buildDates(arr){
  var firstSunday = startDate || dateOffSet(getLatestSaturday(), - arr[0].length * 7 + 1 ),
      w = arr[0].length,
      date, str, num, i, j, k,
      output = [];

  for(j=0; j<w; j++){  //Switch i-j loops to output dates in chronological order.
    for(i=0; i<7; i++){
      date = dateOffSet(firstSunday, i + j*7);
      str  = '' + date.getDate();
      if(str.length == 1)  str = '0' + str;
      str += ' ' + date.toLocaleString('en-us', { month: 'short' }) + ' ' + date.getFullYear();

      num = arr[i][j];
      if     (num>='0' && num<='9')  num = parseInt(num);
      else if(num>='A' && num<='Z')  num = num.charCodeAt(0) - 55;  // Chars A-Z => 10-35.
      else if(num>='a' && num<='x')  num = num.charCodeAt(0) - 61;  // Chars a-x => 36-59.
      else num = 0;  //Also space char is equivalent to a zero.
      for(k=1; k<=num; k++){
        output.push(str + ' 12:' + (k<10?'0':'') + k);
      }
    }
  }

  output.push('');  //Make it end with a newline.
  return output.join('\r\n');
}
