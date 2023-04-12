const express = require('express');
const bodyParser = require('body-parser').json();
const cors = require("cors");
const deepl = require('deepl-node');

const deeplKey = "2b2f1cdb-c324-a0da-7107-dbecc04e19f1:fx";
const deeplTranslator = new deepl.Translator(deeplKey);

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


app.post('/api/getQuestions', bodyParser, (req, res) => {
	//let language = req.body.language;		// TODO: implement multiple languages
	let language = "Spanish";		
	var dictionaryEntries = {};
	// TODO: import all entries of specified language

	var quizEntries = {};
	// TODO: randomly select 10 entries from dictionaryEntries to put into quizEntries

	var quizQuestions = {};
	// TODO: convert into json format of quiz entries including fake answers and the correct answer

	res.type("application/json");
	res.send(quizQuestions)
})

app.get('/api/getGerman', bodyParser, async (req, res) => {
	//let original = req.word;
	let original = "hello";
	console.log(original);
	try {
		var translationResult = await deeplTranslator.translateText(original, 'en', 'de');
		translationResult = translationResult.text;
		console.log("try " + translationResult);
	} catch (e) {
		var translationResult = "ERROR";
		console.log("catch error");
	}
	res.send(translationResult);
})


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