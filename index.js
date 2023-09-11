const express = require('express');
const bodyParser = require('body-parser').json();
const cors = require("cors");
const deepl = require('deepl-node');	// for deepl API translator
const mongoose = require("mongoose");	
const MongoClient = require("mongodb").MongoClient;

const deeplKey = "2b2f1cdb-c324-a0da-7107-dbecc04e19f1:fx";
const deeplTranslator = new deepl.Translator(deeplKey);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
	//origin: "https://just-enough.azurewebsites.net"   //TODO: add back in after testing
}));


// URI for MongoDB Database
const uri = "mongodb+srv://juliegdosher:ScrumTeamDPS@dictionary.s5gatyt.mongodb.net/_dictionary";

// Connect to MongoDB
const client = new MongoClient(uri).db("_dictionary");
async function connectDB() {
	try {
		await mongoose.connect(uri)
	}
	catch(err) {
		console.log(err)
	}
}
connectDB()

// MongoDB Collections
const entryColl = client.collection("entries");
const questionColl = client.collection("questions");

// Define schemas
const Schema = mongoose.Schema;
const vocabSchema = new Schema({
    english: String, 
    language: String,
    translation: String,
    type: String
});
const questionSchema = new Schema({
    type: String, 
	language: String,
	question: String,
	answer_a: String,
	answer_b: String,
	answer_c: String,
	answer_d: String,
	correct_answer: String
});

// Define models
const Entry = mongoose.model('Entry', vocabSchema) 
const Question = mongoose.model('Question', questionSchema)


// base of server
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


//// MongoDB APIs ////

// gets (vocab) Entries for Learn tab
app.post('/api/getLearn', bodyParser, async (req, res) => {
	let languages = req.body.languages;
	let types = req.body.types;

	var entries = [];
	for (i = 0; i < languages.length; i++) {
		for (j = 0; j < types.length; j++) {
			var cursor = Entry.find({ language: languages[i], type: types[j] }).cursor()
			for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
				entries.push(doc);
			}
		}
	}
	
	res.type('application.json');
	res.send(JSON.stringify(entries));
});

// gets (vocab) Entries for Flashcards tab
app.post('/api/getFlashcards', bodyParser, async (req, res) => {
	let language = req.body.language;
	let type = req.body.type;

	let entries = await entryColl.find({ language: language, type: type }).toArray();
	res.type('application.json');
	res.send(JSON.stringify(entries));
});

// gets Questions for Quiz tab 
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


//// Language Translation APIs ////

// gets French translation for Dictionary Tab
app.post('/api/getFrench', bodyParser, async (req, res) => {
	let original = req.body.word;
	try {
		var translationResult = await deeplTranslator.translateText(original, 'en', 'fr');
		translationResult = translationResult.text;
	} catch (e) {
		var translationResult = "ERROR";
	}
	res.type('application/json');
	res.send(translationResult);
})


// gets German translation for Dictionary Tab
app.post('/api/getGerman', bodyParser, async (req, res) => {
	let original = req.body.word;
	try {
		var translationResult = await deeplTranslator.translateText(original, 'en', 'de');
		translationResult = translationResult.text;
	} catch (e) {
		var translationResult = "ERROR";
	}
	res.type('application/json');
	res.send(translationResult);
})

// gets Norwegian translation for Dictionary Tab
app.post('/api/getNorwegian', bodyParser, async (req, res) => {
	let original = req.body.word;
	try {
		var translationResult = await deeplTranslator.translateText(original, 'en', 'nb');
		translationResult = translationResult.text;
	} catch (e) {
		var translationResult = "ERROR";
	}
	res.type('application/json');
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
	console.error("Error")
	res.type('text/plain')
	res.status(500)
	res.send('Server Error')
});


//Start server on a specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});