const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const storage = require('node-persist');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'todolist',
});

connection.connect();

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

// index page open
app.get('/',async function(req,res){
    await storage.init();
    var user_login =  await storage.getItem('admin_login')

    if(user_login == 0)
    {
        res.render('index')
    }
    else{
        res.redirect('/dashboard')
    }

})

// display task and user 
app.get('/dashboard',async function (req, res) {

    await storage.init();
    var user_login =  await storage.getItem('admin_login')

    // var query = "SELECT * from task"
    var query = "select task.id, task.task_name, user.name, status from task inner join user on task.user_id = user.id";
    
    connection.query(query, function (error, results, fields) {
        if (error) throw error;

        if(user_login == 1)
        {
            res.render('dashboard',{results});
        }
        else{
            res.redirect('/')            
        }
    })
})

//  log in
app.post('/', async function (req, res) {
    var user = req.body.username;
    var pass = req.body.userpassword;

    var query = "select * from admin where username = '" + user + "' and password ='" + pass + "' ";

    connection.query(query,async function (error, results, fields) {
        if (error) throw error;

        if (results.length == 1) {
            await storage.init();
            await storage.setItem('admin_login',1)
            res.redirect('/dashboard');
        }
        else {
            res.redirect('/');
        }
    })
});

// logout function
app.get('/logout', async function (req, res) {

    await storage.init();
    await storage.setItem('admin_login',0)

    res.redirect('/')
})

// add user 
app.get('/Add_User', function (req, res) {
    res.render('AddUser');
}); 

app.post('/Add_User', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var contact = req.body.contact;

    var query = "INSERT INTO user(name, email, password, contact) VALUES ('"+name+"','"+email+"','"+password+"','"+contact+"')";

    connection.query(query, function (error, results, fields) {
        if (error) throw error;
            res.redirect('/Add_User');
    })
}); 

// add task
app.get('/Add_task',function (req, res) {
    var query = "select * from user";

    connection.query(query, function (error, results, field) {
        if (error) throw error;
        res.render('AddTask',{results});
    });
});


app.post('/Add_Task', function (req, res) {
    var user_id = req.body.user_id;
    var task = req.body.task;

    var query = "INSERT INTO task(task_name, user_id ) VALUES ('"+task+"','"+user_id+"')";

    connection.query(query, function (error, results, fields) {
        if (error) throw error;
            res.redirect('/Add_Task');
    })
}); 

// pending
app.get('/pending',function(req,res){
    // var query = "SELECT * from task where status = 0"
    var query = "select task.id, task.task_name, user.name from task inner join user on task.user_id = user.id where status = 0";
    
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('pending',{results});
    })
})

// Complite
app.get('/complite',function(req,res){
    // var query = "SELECT * from task where status = 1"
    var query = "select task.id, task.task_name, user.name from task inner join user on task.user_id = user.id where status = 1";
    
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('complite',{results});
    })
})

// Decline
app.get('/decline',function(req,res){
    // var query = "SELECT * from task where status = 2"
    var query = "select task.id, task.task_name, user.name from task inner join user on task.user_id = user.id where status = 2";
    
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('decline',{results});
    })
})
app.listen(3000);
