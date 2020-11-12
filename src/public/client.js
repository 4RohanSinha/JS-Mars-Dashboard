//example of Immutable.JS in use is with the Immutable List for possible_displays and rovers attribute
let store = {
	user: { name: 'Student' },
	current_display: 'MARS DASHBOARD',
	apod: '',
	possible_displays: Immutable.List(['MARS DASHBOARD', 'Curiosity', 'Opportunity', 'Spirit']),
	rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
	Curiosity: createEmptyRoverObject('Curiosity'),
	Opportunity: createEmptyRoverObject('Opportunity'),
	Spirit: createEmptyRoverObject('Spirit')
};

//generalizes process of creating new, empty objects in store for each rover
function createEmptyRoverObject(rover_name) {
	//current_index in photos attribute is undefined because functions later on check if it is undefined or not - if it is undefined, an API call will be made to retrieve rover photos
	return {
		details: { name: rover_name, needsFetch: true },
		photos: { photos: [], current_index: undefined }
	};
};

const root = document.getElementById('root');

const updateStore = (store, newState) => {
	store = Object.assign(store, newState);
	render(root, store);
};

const render = (root, state) => {
	root.innerHTML = App(state);
};

const App = (state) => {
	//this function checks for current_display of state and sends different content accordingly
	//each piece contains the nav bar
	if (state.current_display == 'MARS DASHBOARD') {
		return `
			<header></header>
			<main>
				<section>
					${displayNavBar(state)}
				</section>
				<section>
				<br /><br />
					<h1><span class="title">Main Page: Rover Overview</span></h1>
					<br /><br /><br /><br /><br />
					<p>Click on any rover below or in the navigation bar to see the latest photos.</p>
				</section>
				<section>
					${displayHomePageRoverInfo(state, displayInitialRoverInformation)}
				</section>
			</main>
			<footer></footer>
		`;
	} else if (state.rovers.includes(state.current_display)) { //if the current display is for a rover
		return `
			<header></header>
			<main>
				<section>
					${displayNavBar(state)}
				</section>
				<section>
					<h1><span class="title" style="font-size: 30px">${state.current_display}</span></h1>
				</section>
				<section>
					<p class="instructions"> The information for the rover ${state.current_display} is below. For the photos, scroll down, and use the Previous/Next buttons to navigate.</p>
				</section>
				<section>
					${displayRoverGalleryView(state[state.current_display], displayRoverDetails)}
				</section>
			</main>
		`;
	} else { //in case there is an error and the current display is not for a rover or for the home page
		return `
			<header></header>
			<main>
				<section>
					${displayNavBar(state)}
				</section>
				<br /><br />
				<section>
					<h1><span class="title">Error</span></h1>
					<br /><br />
					Some unknown error has occurred. Use the navigation bar and click on the first button to go back to the home page.
				</section>
			</main>
		`;
	}
};

window.addEventListener('load', () => {
	render(root, store);
});

//this function renders the nav bar html to the webpage
const displayNavBar = (state) => {
        const selected_class = ' nav-selected'; //this string will be added to the nav bar button if the link is for the current selected page

	//for every display, generate html content for the button
	//there is a check if the display title is equal to the current display
	//	if this is the case, add the class name nav-selected to the class attribute
	//also, for each item in the navbar, create a button that, when clicked, will update the store with the new display (corresponding to button)
	//also, bold only the MARS DASHBOARD button since it is the home page - checks if display == MARS DASHBOARD and adds opening and closing strong tag if so
	//uses the ternary operator to do this if-else checking in much less code
        const navbar_data_arr = state.possible_displays.map((display) => {
		//EXPLANATION above
                const lidata = `<li class="nav-link${(display == state.current_display) ? selected_class : ''}">

		<button onclick="updateStore(store, {current_display: '${display}'});">
			${(display == 'MARS DASHBOARD') ? '<strong>' : ''} ${display} ${(display == 'MARS DASHBOARD') ? '</strong>' : ''}
		</button>

			</li>`;
                return lidata;
        });

	//combine all the html content from the array above
	const navbar_data_str = navbar_data_arr.reduce((total, htmlContent) => total + htmlContent);

	//return the string content with the lis wrapped in a ul tag
        return `<ul class="nav-bar">${navbar_data_str}</ul>`;
};

//returns home page basic info about rovers
//HOF #1
const displayHomePageRoverInfo = (state, roverInfoDisplayFunction) => {
	//get array of html content for each rover - content generated in roverInfoDisplayFunction that is passed in
	const outputContentArr = state.rovers.map((rover) => roverInfoDisplayFunction(state[rover]));
	
	//combine array into single string
	const outputContentStr = outputContentArr.reduce((total, htmlRover) => total + htmlRover);

	//return it
	return outputContentStr;
};

//return initial rover info for home page
//relies on displayRoverPhotos - passes in false to have the photo not appear in gallery view - it should appear smaller - the user can click on each rover to look at all the photos in a gallery
const displayInitialRoverInformation = (rover) => {
	return `
		<div class='rover-button' onclick='updateStore(store, {current_display: "${rover.details.name}"});'>
			<br /><strong>${rover.details.name ? rover.details.name : 'Loading'}</strong><br /><br /><br /><br />
			${displayRoverPhotos(rover, false)}<br />
			${displayRoverDetails(rover)}
		</div>
	`;
};

//displays detailed gallery view when a rover is clicked
const displayRoverGalleryView = (rover, rover_details_display_function) => {
	return `<div class="rover-information">${rover_details_display_function(rover)}</div>
		${displayRoverPhotoAndNavigation(rover)}
	`;
};

//returns the rover details - used in both home and gallery view
const displayRoverDetails = (rover) => {
	const loadingString = 'Loading...';
	//loading Mars photo
	const imageLoadingSrc = '<br /><img src="assets/Mars_Loading.png" class="mars-load" style="width: 50px; position: absolute; left: 90%;" />';

	if (rover.details.needsFetch)
		fetchRoverInformation(rover.details.name);

	//uses ternary operator to check if each rover attribute has a value or not (if info has been retrieved from NASA API)
	//if so, returns the data
	//else, says 'Loading"
	return (`${rover.details.launch_date ? '' : imageLoadingSrc}<br /><br />
                        <span>Launch date: ${rover.details.launch_date ? rover.details.launch_date : loadingString}</span><br />
                        <span>Landing date: ${rover.details.landing_date ? rover.details.landing_date : loadingString}</span><br />
                        <span>Status: ${rover.details.status ? rover.details.status : loadingString}</span><br />
                        <span>Total number of photos: ${rover.details.total_photos ? rover.details.total_photos : loadingString}</span><br />
                        <span>Latest update: ${rover.details.max_date ? rover.details.max_date : loadingString}</span><br />`);
};

const displayRoverPhotoAndNavigation = (rover) => {
	//a div containing the controls in the gallery view to move forward or backward
	//onclick attribute used, along with backwardPhoto and forwardPhoto functions
	//these functions simply return new versions of a Curiosity, Opportunity, or Spirit attribute for the store
	//the buttons actually update the stores with these new versions
	return (`
		<div class="controls">
			<button onclick="updateStore(store, backwardPhoto(store.${rover.details.name}))">Previous</button>
			<span>${rover.photos.current_index+1} of ${rover.photos.photos.length}</span>
			<button onclick="updateStore(store, forwardPhoto(store.${rover.details.name}))">Next</button>
		</div>
		${displayRoverPhotos(rover, true)}
	`);
};

const displayRoverPhotos = (rover, isGalleryView) => {
	//if the current index is undefined - the data for the photos in the rover is not in the store so it needs to be fetched
	if (rover.photos.current_index == undefined) {
		fetchLatestRoverPhotos(rover.details.name);
	}

	//returns html content with the image content based on whether the function call is for gallery view or for home view (first page) - identified by the isGalleryView parameter
	if ((rover.photos.photos && rover.photos.current_index != undefined) && rover.photos.current_index < rover.photos.photos.length) {
		if (isGalleryView) {
			return `<img src="${rover.photos.photos[rover.photos.current_index].img_src}" class="cur-gallery-photo" />`;
		}

		return `<img src="${rover.photos.photos[rover.photos.current_index].img_src}" width="15%"/>`;
	}

	else { 
		return ``; 
	}
};

//returns a new rover object with the current index updated => this does not directly update the store
//instead, the object returned by this function can be used with updateStore to make changes
//calling the updateStore function is included in the onclick attribute in the navigation buttons
const movePhoto = (rover, change) => {
	let final_index = 0; //initial value - this will be changed later

	//if moving the gallery backward causes a current index less than zero, move to the last photo in the list
	if (rover.photos.current_index+change < 0) {
		final_index = rover.photos.photos.length - 1;
	} else if (rover.photos.current_index+change >= rover.photos.photos.length) { //if all of the photos have been scrolled through, then move back to the first photo
		final_index = 0;
	} else {
		//the final index will be between 0 and last index (inclusive) and therefore will not cause an error
		final_index = rover.photos.current_index+change;
	}

	//returns a new object with the updated current index
	return {
		[rover.details.name]: {
			...rover,
			photos: {
				...rover.photos,
				current_index: final_index
			}
		}
	};
};

//these two functions just simplify calling the movePhoto function

//increments current photo index by 1 => moves photos forward
const forwardPhoto = (rover) => {
	return movePhoto(rover, 1);
};


//decrements current photo index by 1 => moves photos backward
const backwardPhoto = (rover) => {
	return movePhoto(rover, -1);
};

//------------------------------------------------------ API CALLS

//makes a more specific call to the fetchRoverPhotos function - pulls out the max_date for the corresponding rover from the store and supplies it to the fetchRoverPhotos function
const fetchLatestRoverPhotos = (rover_name) => {
	if (store[rover_name].details.max_date)
		fetchRoverPhotos(rover_name, store[rover_name].details.max_date);
};

const fetchRoverPhotos = (rover_name, date) => {
	if (store[rover_name].photos.current_index != undefined)
		return;

	//this line is to avoid repeated calls to fetch the photos
	//the current_index is initially set to undefined so that it will be known when to call this fetch function
	//now it is set to zero to avoid too many calls to the NASA API
	//otherwise, this would keep sending calls to the API until one of the requests gets a response
	updateStore(store, {
		[rover_name]: {
			...store[rover_name],
			photos: {
				...store[rover_name].photos,
				current_index: 0
			}
		}
	});

	//fetch photos with the specified date
	//updates store with response
	fetch(`/${rover_name.toLowerCase()}/photos/${date}`)
		.then(data => data.json())
		.then(data => data.photos)
		.then(data => updateStore(store, {
			[rover_name]: {
				...store[rover_name],
				photos: { 
					photos: data,
					current_index: 0
				}
			}
		}))
		.catch(err => console.error(err));
};


const fetchRoverInformation = (rover_name) => {
	//this function is needed to get basic info about the rover
	//for example, the latest photo update
	//then the correct date can be used in the next call to the API for photos
	updateStore(store, {
		[rover_name]: {
			...store[rover_name],
			details: {
				...store[rover_name].details,
				needsFetch: false
			}
		}
	});

	fetch(`/${rover_name.toLowerCase()}/information`)
		.then(data => data.json())
		.then(data => updateStore(store, {
			[rover_name]: {
				...store[rover_name],
				details: data
			}
		}))
		.catch(err => console.error(err));

};
