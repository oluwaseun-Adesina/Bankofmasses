require("dotenv").config();
require("./config/database").connect();
const User = require("./model/user");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const cors = require("cors");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "ejs");


//static files 
app.use(express.static("public"));
//routes
//register

app.get("/", (req, res) => {
    res.render("register");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) =>{
    const {firstName, lastName, email, password} = req.body;

    //simple validation
    try {
        // Get user input
        const { firstName, lastName, email, password } = req.body;

        console.log(req.body);
    
        // Validate user input
        if (!(email && password && firstName && lastName)) {
          res.status(400).send("All input is required");
        }
    
        // check if user already exist 
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });
    
        if (oldUser) {
          return res.status(409).send("User Already Exist. Please Login");
        }
     
        //Encrypt user password
        encryptedUserPassword = await bcrypt.hash(password, 10);
        const accountnumber = Math.floor(Math.random() * 1000000000);
        //balance = 0;

    
        // Create user in our database
        const user = await User.create({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(), // sanitize
          password: encryptedUserPassword,
          accountnumber: accountnumber 
        });
    
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h", 
          }
        );
        // save user token
        user.token = token;
    
        // return new user
        //res.status(201).json(user);

        res.render("login");
      } catch (err) {
        console.log(err);
      }
      // Our register logic ends here
    

})

  
//login

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {

    // Our login logic starts here
     try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "5h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        //return res.status(200).json(user);
        console.log(user)
        return res.status(200).render("dashboard", {user: user});
      }
      return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
      
    // Our login logic ends here
  }) 

app.post("welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.get('/welcome', cors(), auth, (req, res) => {
    res.status(200).send("Welcome to FreeCodeCamp 🙌 ");
  });

//transaction

app.get("/transaction", (req, res) => {
    res.render("transaction");
});

app.post("/transaction", auth, async (req, res) => {
    const { accountnumber, amount, type } = req.body;
    const { user_id } = req.user;
    
    try {
        // Get user input
        const { accountnumber, amount, type } = req.body;
        const { user_id } = req.user;
        
        // Validate user input
        if (!(accountnumber && amount && type)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne ({ accountnumber });
        if (user) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, accountnumber },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "5h",
                }
            );
            // save user token
            user.token = token;
            // user
            return res.status(200).json(user);
        }
        return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our transaction logic ends here
});


//transfer money

app.get("/transfer", (req, res) => {
    res.render("transfer");
});


app.post("/transfer", async (req, res) => {
    const { accountnumber, amount } = req.body;
    //const { user_id } = req.user;
    
    try {
        // Get user input
        const { accountnumber, amount } = req.body;
        //const { user_id } = req.user; 

        // Validate user input 
        if (!(accountnumber && amount)) {
            res.status(400).send("All input is required");

        }
        // Validate if user exist in our database
        const user = await User.findOne ({ accountnumber });
        if (user) {
            // Create token
            // const token = jwt.sign(
            //     { user_id: user._id, accountnumber },
            //     process.env.TOKEN_KEY,
            //     {
            //         expiresIn: "5h",
            //     }
            // );
            // // save user token
            // user.token = token;
            // user
            //return res.status(200).json(user);
            
            //validate if user has enough balance
            if (user.balance < amount) {
                return res.status(400).send("Insufficient balance");
            }else {
                user.balance = user.balance - amount;
                user.save();

                return res.status(200).send("Transfer successful");
            }



            

        }
        return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our transfer logic ends here
});


//deposit money

app.get("/deposit", (req, res) => {
    res.render("deposit");
}); 

app.post("/deposit", async (req, res) => {
    const { accountnumber, amount } = req.body;
    //const { user_id } = req.user;

    try {
        // Get user input
        const { accountnumber, amount } = req.body;
        //const { user_id } = req.user;

        // Validate user input
        if (!(accountnumber && amount)) {
            res.status(400).send("All input is required");

        }
        // Validate if user exist in our database
        const user = await User.findOne ({ accountnumber });
        if (user) {
            // Create token
            // const token = jwt.sign(
            //     { user_id: user._id, accountnumber },
            //     process.env.TOKEN_KEY,
            //     {
            //         expiresIn: "5h",
            //     }
            // );
            // save user token
            //user.token = token;
            // user
            //return res.status(200).json(user);

            //update user balance
            user.balance = user.balance + amount;
            user.save();

            return res.status(200).send("Deposit successful");

        }
        return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our deposit logic ends here
});

//view balance
app.post("/balance", auth, async (req, res) => {
    const { accountnumber } = req.body;
    const { user_id } = req.user;

    try {
        // Get user input
        const { accountnumber } = req.body;
        const { user_id } = req.user;
        
        // Validate user input
        if (!(accountnumber)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne ({ accountnumber });

        if (user) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, accountnumber },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "5h",
                }
            );
            // save user token
            user.token = token;
            // user
            //return res.status(200).json(user);

            //return user balance
            return res.status(200).send("Your balance is " + user.balance);

        }
        return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our balance logic ends here
});


module.exports = app; 