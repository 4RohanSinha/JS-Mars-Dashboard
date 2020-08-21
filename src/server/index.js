require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

const getRoverInformation = async (rover) => {
	try {
		const rover_photo_manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
			.then(res => res.json());
		return rover_photo_manifest.photo_manifest;
	} catch (err) {
		console.log('error: ', err);
		return {'error': err};
	}
}

const getRoverPhotoInformation = async (rover, date) => {
	try {
		const rover_photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`)
		.then(res => res.json());
		return rover_photos;
	} catch (err) {
		console.log('error: ', err);
		return {'error': err};
	}
}

let cnt = 0;
// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
	cnt++;
	console.log(cnt);
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/:rover', async (req, res) => {
	const roverInfo = await getRoverInformation(req.params.rover);
	cnt++;
	console.log(cnt);
	res.send(roverInfo);
});

app.get('/rover_photos/:rover/:date', async (req, res) => {
	const roverInfo = await getRoverPhotoInformation(req.params.rover, req.params.date);
	cnt++;
	console.log(cnt);
	res.send(roverInfo);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
