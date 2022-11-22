const express = require("express");
const app = express();
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const dotenv = require("dotenv");
config = dotenv.config();
//const { registerValidation, loginValidation } = require('../validation');

//middle ware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//set view engine
app.set("view engine", "ejs");

//connect to database
const mongoose = require("mongoose");
const { json } = require("express");
mongoose
  .connect(process.env.dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo Connection Open!");
    app.listen(3000, () => {
      console.log("App is listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("Mongo Connection Error!");
    console.log(err);
  });

  //handle errors 

  const handleErrors = (err) =>{
    console.log(err.message, err.code); 
    let errors = { firstname: '', lastname: '', email: '', password: '', phone: '', address: ''};

    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'Email not registered';
    }

    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'incorrect password';
    }

    //duplicate error code
    if (err.code === 11000){
        errors.email = 'That email is already registered';
        return errors;
    }

    //validation errors 
    if (err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) =>{
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}



//register user
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  //validate user
  // const { error } = registerValidation(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  //check if user already in database
  const emailExist = await User.findOne({
    email: req.body.email,
  });
  if (emailExist) return res.status(400).send("Email already exists");

  //hash password
  const salt = await bcrypt.genSalt(10);
  console.log(req.body.password);
  console.log(req.body.email);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  ac = Math.floor(100000 + Math.random() * 900000);

  //create new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    accountnumber: ac,
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user });
  } catch (err) {
    res.status(400).send(err);
  }
});

//login user
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  //validate user
  // const { error } = loginValidation(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  //check if email exists
  const user = await User.findOne({ 

  // email: req.body.email,
  email: json.stringify(email)
  }).then((user) => {
    if (!user) {

      return res.status(400).send("Email is not found");
    }
    //check if password is correct
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (result === true) {
        //create and assign a token
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
        res.header("auth-token", token).send(token);
        res.redirect("/dashboard");
      } else {
        res.send("Incorrect password");
      }
    });
  });

  
  // if (!user) return res.status(400).send("Email or password is wrong")

  // if(!user){
  //   res.status(400).json({errors: handleErrors(err)});
  // }
  // else{
    
  // } 

  //check if password is correct
  // const validPass = await bcrypt.compare(req.body.password, user.password);
  // if (!validPass) return res.status(400).send("Email or password is wrong");
 
  //create and assign a token
//   const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
//   res.header('auth-token', token).send(token);

  res.send(user);

  res.send("Logged in!");


});

//transfer money
app.get("/transfer", (req, res) => {
  res.render("transfer");
});

app.post("/transfer", async (req, res) => {
  //check if account number exists
  const user = await User.findOne({
    accountnumber: req.body.accountnumber,
  });
  console.log(user);
  if (!user) return res.status(400).send("Account number does not exist");

  //check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is wrong");

  //check if amount is valid
  if (req.body.amount <= 0) return res.status(400).send("Amount is invalid");

  //check if balance is sufficient
  if (req.body.amount > user.balance)
    return res.status(400).send("Insufficient balance");

  //check if account number is same
  if (req.body.accountnumber == req.body.accountnumber2)
    return res.status(400).send("Account numbers cannot be same");

  //subtract amount from sender
  const user2 = await User.findOne({
    accountnumber: req.body.accountnumber2,
  });
  user.balance = user.balance - req.body.amount;
  user2.balance = user2.balance + req.body.amount;

  //update transaction
  user.transactions =
    user.transactions + "Deposit of " + req.body.amount + " on " + Date() + " ";

  try {
    const savedUser = await user.save();
    const savedUser2 = await user2.save();
    res.send({ user: user });
    res.send("Transfer successful!");
  } catch (err) {
    res.status(400).send(err);
  }

  res.send("Transfer successful!");
});

//view balance
app.get("/balance", (req, res) => {
  res.render("balance");
});

app.post("/balance", async (req, res) => {
  //check if account number exists
  const user = await User.findOne({
    accountnumber: req.body.accountnumber,
  });
  if (!user) return res.status(400).send("Account number does not exist");

  //check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is wrong");

  res.send("Balance is " + user.balance);
});

//view transactions
app.get("/transactions", (req, res) => {
  res.render("transactions");
});

app.post("/transactions", async (req, res) => {
  //check if account number exists
  const user = await User.findOne({
    accountnumber: req.body.accountnumber,
  });
  if (!user) return res.status(400).send("Account number does not exist");

  //check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is wrong");

  res.send("Transactions are " + user.transactions);
});

//deposit money
app.get("/deposit", (req, res) => {
  res.render("deposit");
});

app.post("/deposit", async (req, res) => {
  //check if account number exists
  const user = await User.findOne({
    accountnumber: req.body.accountnumber,
  });
  if (!user) return res.status(400).send("Account number does not exist");

  //check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is wrong");

  //check if amount is valid
  if (req.body.amount <= 0) return res.status(400).send("Amount is invalid");

  //add amount to balance
  user.balance = user.balance + req.body.amount;

  //update transcation
  user.transactions =
    user.transactions + "Deposit of " + req.body.amount + " on " + Date() + " ";

  try {
    const savedUser = await user.save();
    res.send({ user: user });
    res.send("Deposit successful!");
  } catch (err) {
    res.send(err);
  }
});

//withdraw money
app.get("/withdraw", (req, res) => {
  res.render("withdraw");
});

app.post("/withdraw", async (req, res) => {
  //check if account number exists
  const user = await User.findOne({
    accountnumber: req.body.accountnumber,
  });
  if (!user) return res.status(400).send("Account number does not exist");

  //check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is wrong");

  //check if amount is valid
  if (req.body.amount <= 0) return res.status(400).send("Amount is invalid");

  //check if balance is sufficient
  if (req.body.amount > user.balance)
    return res.status(400).send("Insufficient balance");

  //subtract amount from balance
  user.balance = user.balance - req.body.amount;

  //update transactions
  user.transactions =
    user.transactions +
    "Withdrawal of " +
    req.body.amount +
    " on " +
    Date() +
    " ";

  try {
    const savedUser = await user.save();
    res.send({ user: user });
    res.send("Withdraw successful!");
  } catch (err) {
    res.send(err);
  }
});
