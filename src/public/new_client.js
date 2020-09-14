/* TODO: This file is a refactored form of client.js that now uses Immutable.JS*/
let store = Immutable.Map({
	user: { name: 'Student' },
	current_display: 'Main',
	apod: '',
	rovers: ['Curiosity', 'Opportunity', 'Spirit'],
	curiosity: createEmptyRoverObject('Curiosity'),
	opportunity: createEmptyRoverObject('Opportunity'),
	spirit: createEmptyRoverObject('Spirit')
});

const createEmptyRoverObject = (rover_name) => {
	return Immutable.Map({
		details: { name: rover_name, needsFetch: true },
		photos: { photos: undefined, current_index: undefined }
	});
};

const root = document.getElementById('root');

const updateStore = (store, newState) => {
	store = store.merge(newState);
	render(root, store);
};

const render = async (root, state) => {
	root.innerHTML = App(state);
};

const App = (state) => {

	if (state.get('current_display') == 'Main') {

	} else if (state.get('rovers').includes(state.get('current_display'))) {

	}
}

window.addEventListener('load', () => {
	render(root, store);
});

//------------------------------------------------------ API CALLS

const getRoverInformation = (rover) => {

};
