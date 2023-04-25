const express = require('express');
const bodyParser = require('body-parser').json();
const cors = require("cors");
const deepl = require('deepl-node');	// for deepl API translator
const mongoose = require("mongoose");	
const MongoClient = require("mongodb").MongoClient;

// URI for flashcards
const vocabURI = "mongodb+srv://juliegdosher:ScrumTeamDPS@dictionary.s5gatyt.mongodb.net/_dictionary";

// URI for quiz
const quizURI = "mongodb+srv://vykle:0yldDEoOzkWQpKo0@languagequizdb.joo5uwx.mongodb.net/test"

const deeplKey = "2b2f1cdb-c324-a0da-7107-dbecc04e19f1:fx";
const deeplTranslator = new deepl.Translator(deeplKey);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
	//origin: "https://just-enough.azurewebsites.net"   //TODO: add back in after testing
}));


app.get('/', (req, res) => {
	res.type('text/html')
	res.send('Just Enough - Web Server')    
});

// called by client to wake up server
app.get('/api/ping', bodyParser, (req, res) => {
	console.log("Ping recieved");
	res.type("text/html");
	res.send("Ping received!");
  });


// TODO: app.post('/api/getFrench', ...), language code is 'fr'

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

// TODO: app.post('/api/getNorwegian', ...), language code is 'nb'

// start flashcard implementation
let vocabConn = mongoose.createConnection(vocabURI);
let ModelEntry = vocabConn.model('Entry', new mongoose.Schema({
	entrySchema: {
		english: String, 
		language: String,
		translation: String,
		type: String
	}
}));
let Entry = ModelEntry;
let entryClient = new MongoClient(vocabURI).db("_dictionary");
let entryColl = entryClient.collection("entries");

app.post('/api/getFlashcards', bodyParser, async (req, res) => {
	let language = req.body.language;
	let type = req.body.type;

	let entries = await entryColl.find({ language: language, type: type }).toArray();
	res.type('application.json');
	res.send(JSON.stringify(entries));
});
// end flashcard implementation


// start quiz implementation
var quizConn = mongoose.createConnection(quizURI);
var ModelQuestion = quizConn.model('Question', new mongoose.Schema({
	quizSchema: {
		type: String, 
		language: String,
		question: String,
		answer_a: String,
		answer_b: String,
		answer_c: String,
		answer_d: String,
		correct_answer: String
	}
}));
const Question = ModelQuestion;
const quizClient = new MongoClient(quizURI).db("test");
const quizColl = quizClient.collection("questions");

app.post('/api/getQuestions', bodyParser, async (req, res) => {
	let language = req.body.language;
	let type = req.body.type;
	Question.aggregate([ 
			{ $match: {"$and": [{language: language }, {type: type}]}},
			{ $sample: { size: 10 } } 
	]).then((questions) => {
    	res.type('application/json');
	    res.send(JSON.stringify(questions))
    })
})
// end quiz implementation


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