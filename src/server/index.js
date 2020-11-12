require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const immutable = require('immutable')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

//function to return photo_manifest data for rover
const getRoverInformation = async (rover) => {
	try {
		const rover_photo_manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
			.then(res => res.json())
			.catch(err => console.error(err));
		return rover_photo_manifest.photo_manifest;
	} catch (err) {
		console.log('error: ', err);
		return {'error': err};
	}
}

//function to return photos data for rover on a given date
const getRoverPhotoInformation = async (rover, date) => {
	try {
		const rover_photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`)
		.then(res => res.json())
		.catch(err => console.error(err));
		return rover_photos;
	} catch (err) {
		console.log('error: ', err);
		return {'error': err};
	}
}

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
	    .catch(err => console.error(err));
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

// colon notation to allow for request parameters
//
// request for basic rover info
app.get('/:rover/information', async (req, res) => {
	const roverInfo = await getRoverInformation(req.params.rover);
	res.send(roverInfo);
});

//request for rover photos on a given date
app.get('/:rover/photos/:date', async (req, res) => {
	const roverPhoto = await getRoverPhotoInformation(req.params.rover, req.params.date);
	res.send(roverPhoto);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
