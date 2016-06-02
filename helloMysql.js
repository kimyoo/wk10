var express = require('express'); 
var mysql = require('./dbcon.js'); 

var app = express(); 


var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//set port
app.set('port', 3000);

//use this directory
app.use(express.static('public'));

//route path
app.get('/',function(req,res,next){
	
	//create context object
	var context = {};
	
	//run select query
	mysql.pool.query('SELECT * FROM workout', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }		
		//set the results to the rows object
		context.results = rows;
		
		//render the context
		res.render('home', context);
	});	
	
	//print url to console
	console.log(req.originalUrl);
});

//add row
app.get('/addrow',function(req,res,next){
	
	//create context object
	var context = {};
	
	//run insert query
	mysql.pool.query("INSERT INTO workout (`name`,`rep`,`weight`,`date`,`measure`) " +
					"VALUES (?, ?, ?, ?, ?)",
					[req.query.name, req.query.rep, req.query.weight, req.query.date, req.query.measure],
					function(err, result){
	
	//check for erros
	if(err){
		next(err);
		return;
	}
	
	//print url to console
	console.log(req.originalUrl);
	
	//show root
	res.redirect("/");
  });
});

//delete row
app.get('/delete',function(req,res,next){
	
	//create context object
	var context = {};
	
	//run delete query
	mysql.pool.query("DELETE FROM workout WHERE id=?",
					[req.query.id],
					function(err, result){
	
	//check for errors
	if(err){
		next(err);
		return;
	}
	
	//print url to console
	console.log(req.originalUrl);
	
	//show root
	res.redirect("/");
  });
});

//update a record
app.get('/update',function(req,res,next){
	
	//create context object
	var context = {};
  
	//print url to console
	console.log(req.originalUrl);
	
	//run select query on this id
	mysql.pool.query("SELECT * FROM workout WHERE id=?", [req.query.id], function(err, result){
		
		//check for errors
		if(err){
		  next(err);
		  return;
		}
		
		//if result comes back...
		if(result.length == 1){
			
			//set variable to result
			var curVals = result[0];
			
			//run update query
			mysql.pool.query("UPDATE workout SET name=?, rep=?, weight=?, date=?, measure=? WHERE id=? ",
				[req.query.name || curVals.name, 
				req.query.rep || curVals.rep, 
				req.query.weight || curVals.weight, 
				req.query.date || curVals.date, 
				req.query.measure || curVals.measure, 
				req.query.id],
				
				//check for errors and show root
				function(err, result){
					if(err){
						next(err);
						return;
					}
					
					//show root
					res.redirect("/");
				}
			);
		}
  });
});

//edit a record
app.get('/edit',function(req,res,next){

	//create context object
	var context = {};
	
	//run select query
	mysql.pool.query("SELECT * FROM workout WHERE id=?", [req.query.id], function(err, rows, fields){
		
		//set the results to the rows object
		context.rowToEdit = rows[0];
		
		//render the context
		res.render('update', context);
	});	
  
	//print url to console
	console.log(req.originalUrl);
});

//reset table from the instructor
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workout", function(err){ //replace your connection pool with the your variable containing the connection pool
	
	
    var createString = "CREATE TABLE workout("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "rep INT,"+
    "weight INT,"+
    "date DATE,"+
    "measure BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset!";
      res.render('resetTable',context);
    })
  });
});

app.listen(app.get('port'), function(){
  console.log('Express started at http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
