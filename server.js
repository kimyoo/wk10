

var express = require('express'); //require express
var mysql = require('./connectSQL.js'); //require my connection info

var app = express(); //initiate express

//initiate handlebars
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
	mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
		
		//set the dArray to the rows object
		context.dArray = rows;
		
		//render the context
		res.render('form', context);
	});	
	
	//print url to console
	console.log(req.originalUrl);
});

//add row
app.get('/addrow',function(req,res,next){
	
	//create context object
	var context = {};
	
	//run insert query
	mysql.pool.query("INSERT INTO workouts (`name`,`reps`,`weight`,`date`,`lbs`) " +
					"VALUES (?, ?, ?, ?, ?)",
					[req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs],
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
	mysql.pool.query("DELETE FROM workouts WHERE id=?",
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
	mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
		
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
			mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
				[req.query.name || curVals.name, 
				req.query.reps || curVals.reps, 
				req.query.weight || curVals.weight, 
				req.query.date || curVals.date, 
				req.query.lbs || curVals.lbs, 
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
	mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, rows, fields){
		
		//set the dArray to the rows object
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
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
	
	
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset!";
      res.render('home',context);
    })
  });
});

//run on 3000
console.log("Running on 3000...")
app.listen(3000);