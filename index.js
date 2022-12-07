const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const port = process.env.PORT || 3000; 


server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    });




    // dbURI = "mongodb+srv://oluwaseun:Password@cluster0.3bxcv.mongodb.net/BankofGroup5?retryWrites=true&w=majority"
    // PORT = 5000
    // TOKEN_KEY = "some auth key"