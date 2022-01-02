// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');
// Start up an instance of app
const app = express();

/* Middleware*/

//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors())
// Initialize the main project folder
app.use(express.static('website'));


// Setup Server
const port = '8080'
const server = app.listen(port, () => console.log(`Server listening on port ${port}`));
// POST route for saving the data in the projectData object
app.post('/saveData', (req, res) => {
    console.log(req.body.data.cod)
    if (req.body.data.cod !== '400' || req.body.data.cod !== '404') {
        projectData.date = (req.body.date)
        projectData.data = (req.body.data);
        projectData.userInput = (req.body.userInput);
        console.log(projectData);
        res.send('POST received successfully!');
    }
})
// GET route for sending the required web page data
app.get('/dataForUser', (req, res) => {
    res.send({
        'date': projectData.date,
        'temperature': projectData.data.main.temp,
        'userResponse': projectData.userInput,
    });
})