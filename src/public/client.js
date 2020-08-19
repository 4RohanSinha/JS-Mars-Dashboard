let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    rover_details: {
	    //TODO: create function to return empty rover
	    'Curiosity': {name: 'Curiosity', needsFetch: true},
	    'Opportunity': {name: 'Opportunity', needsFetch: true},
	    'Spirit': {name: 'Spirit', needsFetch: true},
    },
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
	    <section>
	    ${displayInitialRoverInformation(state.rover_details.Curiosity)}<br />
	    ${displayInitialRoverInformation(state.rover_details.Opportunity)}<br />
	    ${displayInitialRoverInformation(state.rover_details.Spirit)}<br />
	    </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

var numa;
// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
	numa++; console.log(numa);
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
	console.log('image retrieved')
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const displayInitialRoverInformation = (rover) => {
	try {
		const loadingString = 'Loading...';
		const imageLoadingSrc = '<br /><img src="assets/Mars_Loading.png" class="mars-load" style="width: 50px; position: absolute; left: 92%;" />';
		if (rover.needsFetch) {
			getRoverInformation(rover.name);
		}

		return (`
		<div class='rover-button'>
			<span><strong>${rover.name ? rover.name : (loadingString)}</strong></span>${rover.launch_date ? '' : imageLoadingSrc}<br /><br />
			<span>Launch date: ${rover.launch_date ? rover.launch_date : loadingString}</span><br />
			<span>Landing date: ${rover.landing_date ? rover.landing_date : loadingString}</span><br />
			<span>Status: ${rover.status ? rover.status : loadingString}</span><br />
			<span>Total number of photos: ${rover.total_photos ? rover.total_photos : loadingString}</span><br />
			<span>Latest update: ${rover.max_date ? rover.max_date : loadingString}</span><br />
		</div>
		`);
	}
	catch(err) {

		console.error(err);
		return (`<div class='rover'>
				<span>Error: there was an error collecting information for rover ${rover.name}. ${err.message} </span>
			</div>`);
	}
}
// ------------------------------------------------------  API CALLS
// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
	.catch(err => console.log(err));

}

function getRoverInformation(rover) {
	console.log(rover);
	fetch(`http://localhost:3000/${rover.toLowerCase()}`)
		.then(data => data.json())
		.then(data => updateStore(store, {
			rover_details: {
				...store.rover_details,
				[rover]: data
			},
		}))
		.catch(err => console.log(err));
}
