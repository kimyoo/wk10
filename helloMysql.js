var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));


app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workout', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    //context.results = JSON.stringify(rows);
    context.results = rows;
	
    res.render('home', context);
  });
});


app.get('/insert',function(req,res,next){
  var context = {};
  	mysql.pool.query("INSERT INTO workout (`name`,`rep`,`weight`,`date`,`measure`) " +
					"VALUES (?, ?, ?, ?, ?)",
					[req.query.name, req.query.rep, req.query.weight, req.query.date, req.query.measure],
					function(err, result){
    if(err){
      next(err);
      return;
    }
    //res.render('home',context);
	res.redirect("http://ec2-52-37-250-27.us-west-2.compute.amazonaws.com:3000/");
  });
});

app.get('/delete',function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM workout WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    //context.results = "Deleted " + result.changedRows + " rows.";
    //res.render('home',context);
	res.redirect("http://ec2-52-37-250-27.us-west-2.compute.amazonaws.com:3000/");
  });
});




///safe-update?id=1&name=The+Task&done=false
app.get('/edit',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM workout WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
			mysql.pool.query("UPDATE workout SET name=?, rep=?, weight=?, date=?, measure=? WHERE id=? ",
				[req.query.name || curVals.name, req.query.rep || curVals.rep, req.query.weight || curVals.weight, req.query.date || curVals.date, req.query.measure || curVals.measure, 
				req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        //context.results = "Updated " + result.changedRows + " rows.";
        res.redirect("http://ec2-52-37-250-27.us-west-2.compute.amazonaws.com:3000/");
      });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workout", function(err){
    var createString = "CREATE TABLE workout(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
	"rep INT," +
	"weight INT," +
	"date DATE," +
    "measure BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
 
