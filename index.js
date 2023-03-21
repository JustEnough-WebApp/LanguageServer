const express = require('express');
const bodyParser = require('body-parser').json();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
	origin: "https://just-enough.azurewebsites.net"
}));


app.get('/', (req, res) => {
	res.type('text/html')
	res.send('Just Enough - Web Server')    
});

app.get('/api/ping', bodyParser, (req, res) => {
	console.log("Ping recieved");
	res.type("text/html");
	res.send("Ping received!");
  });


// Custom 404 page
app.use((req, res) => {
	res.type('text/plain')
	res.status(404)
	res.send('Not Found')
});

// Custom 500 page
app.use(function (error, req, res, next) {
	console.error(err.message)
	res.type('text/plain')
	res.status(500)
	res.send('Server Error')
});


//Start your server on a specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});