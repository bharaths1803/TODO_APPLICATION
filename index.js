const express = require('express');
const jwt = require('jsonwebtoken');
const zod = require('zod');
const path = require('path');
const fs = require('fs');

const emailSchema = zod.string().email();
const passwordSchema = zod.string().min(6);


const app = express();
app.use(express.json());



const filepath = path.join(__dirname,"tasks.json");


const port = 3000;

const JWT_SECRET = "bharathilovejiraya";

let signedinUser = "";
let completedCnt = 0;



function readData(){
  const data = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(data || "[]");
}

function writeData(tododata){
  fs.writeFile(filepath, JSON.stringify(tododata, null, 4), 'utf-8', function(err){
    if(err){
      console.log("Writing problem");
    }
  })
}

function auth(req, res, next){
  const token = req.headers.token;

  if(token){
    jwt.verify(token, JWT_SECRET, function(err, decodedInformation){
      if(err){
        res.json(
          {
            message : "You are not logged in"
          }
        );
      }
      else{
        const username = decodedInformation.username;
        req.username = username;
        next();
      }
    });
  }
  else{
    res.json(
      {
        message : "You are not logged in"
      }
    );
  }

}


app.post("/signup", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  const usernameResponse  = emailSchema.safeParse(username);
  const passwordRespone  = passwordSchema.safeParse(password);


  if(usernameResponse.success == true && passwordRespone.success == true){

  const users = readData();

  let userFound = false;

  for(let i = 0; i < users.length; i++){
    if(users[i].username === username){
      res.json({
        message : "User already exists"
      })
      return;
    }
  }

  users.push(
    {
      username: username,
      password: password,
      todos : [],
      completedCnt : 0
    }
  );

  writeData(users);

  res.json(
    {
      message: "You are signed up"
    }
  );

  }

  else{
    res.json(
      {
        message: "Invalid email or password"
      }
    );
  }

});

app.post("/signin", function(req, res){

  const username = req.body.username;
  const password = req.body.password;

  let foundUser = false;

  const users = readData();

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === username && users[i].password === password){
      foundUser = users[i];
      break;
    }
  }

  if(foundUser){
    const token = jwt.sign({
        username : username
      },JWT_SECRET);
    res.json(
      {
        token
      }
    );
  }
  else{
    res.json(
      {
        message: "Check correctly or sign up first"
      }
    );
  }

});



app.get("/verify", auth ,function(req, res){

  let foundUser = null;

  const users = readData();

  for(let i = 0; i < users.length; i++){
    if(users[i].username === req.username){
      foundUser = users[i];
      break;
    }
  }

  if(foundUser){
    signedinUser = foundUser.username;
    completedCnt = foundUser.completedCnt;
    res.json(
      {
        message: "User authorized"
      }
    );
  }

  else{
    res.status(404).json(
      {
        message: "User Unauthorized"
      }
    );
  }

});

app.get("/", function(req, res){
  const randomi = req.query.randomi;
  console.log(randomi);
  if(randomi){
    console.log("In domi endpoint");
    res.sendFile(__dirname + "/DOM/index.html");
  }
  else{
    console.log("In login endpoint");
    res.sendFile(__dirname + "/public/index.html");
  }
});
 


app.get("/styles.css", function(req, res){
  const randomi = req.query.randomi;
  console.log(randomi);
  if(randomi){
    console.log("In css domi endpoint");
    res.sendFile(__dirname + "/DOM/styles.css");
  }
  else{
    console.log("In css login endpoint");
    res.sendFile(__dirname + "/public/styles.css");
  }
});


app.post("/add", function(req, res){
  const task = req.body.task;
  const completed = req.body.completed;

  let foundUser = null;

  const users = readData();

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === signedinUser){
      foundUser = true;
      break;
    }
  }

  console.log(signedinUser);

  const obj  = {
    "task" : task,
    "completed" : completed
  };

  users[i].todos.push(obj);
  writeData(users);

  const todosarr = users[i].todos;

  console.log(todosarr);
  res.json(todosarr);

});


app.delete("/remove", function(req, res){
  const idx = req.body.idx;

  const users = readData();

  let foundUser = null;

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === signedinUser){
      foundUser = true;
      break;
    }
  }
  if(foundUser){
    users[i].todos.splice(idx, 1);
  }

  writeData(users);

  const todosarr = users[i].todos;

  res.json(todosarr);

});



app.delete("/removeall", function(req, res){
  const users = readData();

  let foundUser = null;

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === signedinUser){
      foundUser = true;
      break;
    }
  }
  if(foundUser){
    users[i].todos = [];
  }

  writeData(users);

  const todosarr = users[i].todos;

  res.json(todosarr);

});


app.get("/view", function(req, res){
  const users = readData();

  let foundUser = null;

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === signedinUser){
      foundUser = true;
      break;
    }
  }

  const todosarr = users[i].todos;

  res.json(todosarr);
});


app.put("/mark", function(req, res){
  const idx = req.body.idx;
  const completed = req.body.completed;

  let foundUser = null;

  const users = readData();

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === signedinUser){
      foundUser = true;
      break;
    }
  }

  users[i].todos[idx].completed = completed;
  writeData(users);

  const todosarr = users[i].todos;

  res.json(todosarr);

});


app.put("/update", function(req, res){
  const task = req.body.task;
  const completed = req.body.completed;
  const idx = req.body.idx;

  let foundUser = null;

  const users = readData();

  let i = 0;
  for(i = 0; i < users.length; i++){
    if(users[i].username === signedinUser){
      foundUser = true;
      break;
    }
  }

  const obj  = {
    "task" : task,
    "completed" : completed
  };

  users[i].todos[idx] = obj;
  writeData(users);

  const todosarr = users[i].todos;

  res.json(todosarr);

});







app.listen(port, function(){
  console.log(`Listening on port ${port}`);
})