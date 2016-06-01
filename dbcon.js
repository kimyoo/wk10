var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host  : 'localhost',
  user  : 'student',
  password: 'default',
  database: 'student'
});


module.exports.pool = pool;
