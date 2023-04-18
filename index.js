const express = require('express');
const bodyParser = require('body-parser').json();
const cors = require("cors");
const deepl = require('deepl-node');	// for deepl API translator
const mongoose = require("mongoose");	
const MongoClient = require("mongodb").MongoClient;

// URI for dictionary/vocab/flashcards here

const quizURI = "mongodb+srv://vykle:0yldDEoOzkWQpKo0@languagequizdb.joo5uwx.mongodb.net/test"
mongoose.connect(quizURI, {useNewUrlParser: true}, {useUnifiedTopology: true})

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


// gets German Translation for Dictionary Tab
app.post('/api/getGerman', bodyParser, async (req, res) => {
	let original = req.body.word;
	console.log(original);
	try {
		var translationResult = await deeplTranslator.translateText(original, 'en', 'de');
		translationResult = translationResult.text;
		console.log(translationResult);
	} catch (e) {
		var translationResult = "ERROR";
	}
	res.type('application/json');
	res.send(translationResult);
})



///////
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;

const mongooseUri = "mongodb+srv://vykle:0yldDEoOzkWQpKo0@languagequizdb.joo5uwx.mongodb.net/test"
mongoose.connect(mongooseUri, {useNewUrlParser: true}, {useUnifiedTopology: true})

const quizSchema = {
	type: String, 
	language: String,
	question: String,
	answer_a: String,
	answer_b: String,
	answer_c: String,
	answer_d: String,
	correct_answer: String
}

const Question = mongoose.model("question", quizSchema);
const client = new MongoClient(mongooseUri).db("test");
const collection = client.collection("questions");


app.get('/api/getQuestions', function(req, res) {
	Question.find({}).then((questions) => {
      res.type('application/json');
	    res.send(JSON.stringify(questions))
    })
  })





// Custom 404 page
app.use((req, res) => {
	res.type('text/plain')
	res.status(404)
	res.send('Not Found')
});

// Custom 500 page
app.use(function (error, req, res, next) {
	console.error("Error")
	res.type('text/plain')
	res.status(500)
	res.send('Server Error')
});


//Start your server on a specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});