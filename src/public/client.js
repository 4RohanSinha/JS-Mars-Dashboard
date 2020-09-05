let store = {
    user: { name: "Student" },
    current_display: 'Main', //the main screen
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    curiosity: createEmptyRoverObject('Curiosity'),
    opportunity: createEmptyRoverObject('Opportunity'),
    spirit: createEmptyRoverObject('Spirit'),
    rover_details: {
	    //TODO: create function to return empty rover
	    'Curiosity': {name: 'Curiosity', needsFetch: true},
	    'Opportunity': {name: 'Opportunity', needsFetch: true},
	    'Spirit': {name: 'Spirit', needsFetch: true},
    },
    
    curiosity_photos: { photos: undefined, current_index: undefined },
    opportunity_photos: { photos: undefined, current_index: undefined },
    spirit_photos: { photos: undefined, current_index: undefined }
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
    if (store.current_display == 'Main') {
	    return `
		<header></header>
		<main>
		    <section>
	    	    	${displayNavBar(state)}
		    </section>
		    ${Greeting(state.user.name)}
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
		    ${displayInitialRoverInformation(state.rover_details.Curiosity, true)}<br />
		    ${displayInitialRoverInformation(state.rover_details.Opportunity, true)}<br />
		    ${displayInitialRoverInformation(state.rover_details.Spirit, true)}<br />
		    </section>
		</main>
		<footer></footer>
	    `
    } else if (rovers.includes(store.current_display)) {
	    return (`
	    	<header></header>
		<main>
			<section>
	    	    	${displayNavBar(state)}
			</section>
			<h1><span class="title">${store.current_display}</span></h1>
			<section>
				<div class="rover-information">
				${displayInitialRoverInformation(state.rover_details[store.current_display], false)}
				</div>
			</section>
			<section>
				${displayRoverPhotoAndNavigation(state.rover_details[store.current_display].name)}
			</section>
		</main>
		<footer></footer>
	    `);
    }
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

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.image.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.image.url}">here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.explanation}</p>
        `)
    } else {
        return (`
	    <p>${apod.image.title}</p>
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const displayNavBar = (state) => {
	//TODO: make button responsible to entire area
	return (`
		<ul class="nav-bar">
			<li class="nav-link"><button onclick="updateStore(store, { current_display: 'Main' });"><strong>MARS DASHBOARD</strong></button></li>
			<li class="nav-link"><button onclick="updateStore(store, { current_display: 'Curiosity' });">Curiosity</button></li>
			<li class="nav-link"><button onclick="updateStore(store, { current_display: 'Opportunity' });">Opportunity</button></li>
			<li class="nav-link"><button onclick="updateStore(store, { current_display: 'Spirit' });">Spirit</button></li>
		</ul>
	`)
};

const displayInitialRoverInformation = (rover, show_image) => {
	try {
		const loadingString = 'Loading...';
		const imageLoadingSrc = '<br /><img src="assets/Mars_Loading.png" class="mars-load" style="width: 50px; position: absolute; left: 93%;" />';
		if (rover.needsFetch) {
			getRoverInformation(rover.name);
		}

		let img_data = displayRoverPhotos(rover.name);
		if (!show_image) {
			img_data = '';
		}

		return (`
		<div class='rover-button' onclick='(function callback() { console.log("Hello"); updateStore(store, { current_display: "${rover.name}" }); })()'>
			${img_data ? img_data : ''}<br />
			${displayRoverDetails(rover)}
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

const displayRoverDetails = (rover) => {
	const loadingString = 'Loading...';
	const imageLoadingSrc = '<br /><img src="assets/Mars_Loading.png" class="mars-load" style="width: 50px; position: absolute; left: 93%;" />';

	if (rover.needsFetch) {
		getRoverInformation(rover.name);
	}

	return (`<span><strong>${rover.name ? rover.name : loadingString}</strong></span>${rover.launch_date ? '' : imageLoadingSrc}<br /><br />
			<span>Launch date: ${rover.launch_date ? rover.launch_date : loadingString}</span><br />
			<span>Landing date: ${rover.landing_date ? rover.landing_date : loadingString}</span><br />
			<span>Status: ${rover.status ? rover.status : loadingString}</span><br />
			<span>Total number of photos: ${rover.total_photos ? rover.total_photos : loadingString}</span><br />
			<span>Latest update: ${rover.max_date ? rover.max_date : loadingString}</span><br />`);
};

//TODO: pass in store
const displayRoverPhotoAndNavigation = (rover) => {
		//include updateStore calls in onclick so that any future updates to state by button click are part of the return value
	const rover_index = (rover.toLowerCase()) + '_photos';
	return (`
		<div class="controls">
			<button onclick="updateStore(store, backwardPhoto(store, '${rover.toLowerCase()}'))">Previous</button>
			<span>${store[rover_index].current_index+1} of ${store[rover_index].photos.length}</span>
			<button onclick="updateStore(store, forwardPhoto(store, '${rover.toLowerCase()}'))">Next</button>
		</div>
		${displayRoverPhotos(rover, true)}
	`);
};

const displayRoverPhotos = (rover, makeLarge) => {
	const photos = getLatestPhotos(rover, store);
	const rover_index = (rover.toLowerCase()) + '_photos';
	if ((photos && store[rover_index]) && store[rover_index].current_index != undefined) {
		if (makeLarge) {
		return (`
			<img src="${store[rover_index].photos[store[rover_index].current_index].img_src}" class="cur-gallery-photo" />
			`); 
		}

		return (`
			<img src="${store[rover_index].photos[store[rover_index].current_index].img_src}" width="10%" />
			`); 
	}
	else return ``;
	
};

//TODO: pass in store
function getLatestPhotos(rover, state) {
	if (state.rover_details[rover].max_date) {
		if (!store[(rover.toLowerCase()) + '_photos'].current_index) {
			getRoverPhotos(rover, state.rover_details[rover].max_date);
		}

		return store[rover.toLowerCase() + '_photos'].photos;
	}
	else
		return [{img_src: ''}];
}

function createEmptyRoverObject(rover_name) {
	return {
		details: { name: rover_name, needsFetch: true },
		photos: { photos: undefined, current_index: undefined }
	}
}

function movePhoto(state, rover, change_params) {
	const rover_index = rover.toLowerCase() + '_photos';
	let change = change_params;
	let final_index = 0;

	if (state[rover_index].current_index+change < 0) {
		final_index = state[rover_index].photos.length - 1;
	} else if (state[rover_index].current_index+change >= state[rover_index].photos.length) {
		final_index = 0;
	} else {
		final_index = state[rover_index].current_index+change;
	}

	return {
		[rover_index]: {
			...state[rover_index],
			current_index: final_index
		}
	};
}

function forwardPhoto(state, rover) {
	return movePhoto(state, rover, 1);
}

function backwardPhoto(state, rover) {
	return movePhoto(state, rover, -1);
}

// ------------------------------------------------------  API CALLS
// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state
    //fetch(`http://localhost:3000/apod`)
    fetch(`/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
	.catch(err => console.log(err));

}

function getRoverInformation(rover) {
	console.log(rover);
	
	if (!store.rover_details[rover].needsFetch)
		return;

	//update needsFetch member variable because it prevents this function from needlessly being repeatedly called
	updateStore(store, {
		rover_details: {
			...store.rover_details,
			[rover]: {
				...store.rover_details[rover],
				needsFetch: false
			}
		}
	});

	//fetch data
	//fetch(`http://localhost:3000/${rover.toLowerCase()}/information`)
	fetch(`/${rover.toLowerCase()}/information`)
		.then(data => data.json())
		.then(data => updateStore(store, {
			rover_details: {
				...store.rover_details,
				[rover]: data
			},
		}))
		.catch(err => console.log(err));


	//add the needsFetch back to the store - it gets overriden in the fetch function
	updateStore(store, {
		rover_details: {
			...store.rover_details,
			[rover]: {
				...store.rover_details[rover],
				needsFetch: false
			}
		}
	});
}

function getRoverPhotos(rover, date) {
	const store_key = rover.toLowerCase() + '_photos';
	if (store[store_key].current_index != undefined)
		return;
	
	//this line to prevent repeated requests to this function - it takes time for the response from the server to be returned, so it the current_index, which is undefined, is not immediately set by the Promise then statement below
	//therefore, it needs to be set for the above if statement to return from the function and prevent too many requests to this function (which could end up exceeding the maximum number of API requests allowed to NASA)
	updateStore(store, {
		[store_key]: {
			...store[store_key],
			current_index: 0
		}
	});

	//const data = fetch(`http://localhost:3000/${rover.toLowerCase()}/photos/${date}`)
	const data = fetch(`/${rover.toLowerCase()}/photos/${date}`)
		.then(data => data.json())
		.then(data => data.photos)
		.then(data => {
			console.log(data);
			updateStore(store, {
				[store_key]: {
					photos: data,
					current_index: 0
				}
			});
		})
		.catch(err => console.log(err));
}
