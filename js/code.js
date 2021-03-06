(function (){

const buttons = document.querySelectorAll('.buttons button');
const buttonsList = document.querySelector('.buttons');
const reviveBtn = document.querySelector('#revive');

const animal = document.querySelector('.animal img');

//variables for intervals
let pressTimer;
let changeIcon;
let called;

//flags
let press = false;
let ded = false;
let sad = false;

let eatNotify = false;
let cureNotify = false;
let petNotify = false;

//icons in default state
const waitingIcons = ['hello', 'cool', 'music', 'selfie'];

let notifications = [];
const statistics = {};

//Initiate Touch Emulator which allows touch events on mobile
TouchEmulator();

//update statistics value
function setStat( name, value ) {
	statistics[ name ] = value;
	document.querySelector( `#${ name }` ).value = value;
}

//run Notification
function showNotification(need){
	let options;
    switch (need){
    	case 'eat':
    		options = {
			    body: 'Let me eat!',
			    icon: 'img/hungry.png',
			}
    		eatNotify = new Notification('Tamagotchi says', options);
    		notifications.push(eatNotify);
    		break;
    	case 'cure':
    	    options = {
			    body: 'I have fever!',
			    icon: 'img/sick.png',
			}
    		cureNotify = new Notification('Tamagotchi says', options);
    		notifications.push(cureNotify);
    		break;
    	case 'pet':
      	    options = {
			    body: 'Play with me!',
			    icon: 'img/cry.png',
			}
    		petNotify = new Notification('Tamagotchi says', options);
    		notifications.push(petNotify);
    		break;
    	default:
    		return;
    }
}

//turn on the game after death
function revive () {
	ded = false;
	sad = false;
	//turn on event listeners after death
	document.addEventListener('touchend', stopCare);
	buttonsList.addEventListener('touchstart', takeCare);
	//increase stats to default state
	for (var key in statistics) {
		statistics[key] = 50; 
		document.getElementById(`${key}`).value = statistics[key];
	};
	//run default functions
	decreaseStats();
	defaultMood();
}

//turn off the game
function death() {
	ded = true;
	let eatNotify = false;
	let cureNotify = false;
	let petNotify = false;
	notifications.forEach(notify => notify.close());
	//turn off event listeners
	document.removeEventListener('touchend', stopCare);
	buttonsList.removeEventListener('touchstart', takeCare);
	clearInterval(called);
	called = 0;
	clearInterval(changeIcon);
	changeIcon = 0;
	clearInterval(pressTimer);
	pressTimer = 0;
	//change icon
	animal.src = "img/dead.png";
	//show revive button
	reviveBtn.style.display = "block";
	reviveBtn.addEventListener('click', revive);
}

//check if animal isn't neglected
function checkMood() {
	if (press) return;
	sad = false;
	//find smallest value of statistics
	const arr = Object.values(statistics);
	const min = Math.min(...arr);
	Object.entries( statistics ).forEach( ( [ name, value ] ) => {
		if (value == 0) {
			death();
			return;
		};
		if (value < 30){
			sad = true;	
			clearInterval(changeIcon);
			changeIcon = 0;
			if (value == min && name === 'eat'){
				animal.src = "img/hungry.png";
				if (Notification.permission === "granted" && (eatNotify === false)) showNotification(name);
			}
			if (value == min && name === 'cure'){
				animal.src = "img/sick.png";
				if (Notification.permission === "granted" && (cureNotify === false)) showNotification(name);
			}
			if (value == min && name === 'pet'){
				animal.src = "img/cry.png";
				if (Notification.permission === "granted"  && (petNotify === false)) showNotification(name);
			}
		}
	});
}

//reset state when user released button
function stopCare(){
	press = false;
	document.activeElement.blur();
	notifications.forEach(notify => notify.close());
	clearInterval(changeIcon);
	changeIcon = 0;
	clearInterval(pressTimer);
	pressTimer = 0;
	checkMood();
	if (!sad) defaultMood();
}

//increase range value when user push button 
function takeCare (e) {
	//prevent from clicking more than one button at once
	if (press) return;
	//turn off default icons
	clearInterval(changeIcon);
	changeIcon = 0;
	press = true;
	//repeat function as long as user hold the button
	pressTimer = setInterval(function() {
		Object.entries( statistics ).forEach( ( [ name, value ] ) => {
			let target = e.target;
			let maxValue = parseFloat(document.querySelector( `#${ name }` ).max);
			//find stat of pushed button
			if (name === target.dataset.need){
				//increase value
				value++;
				if (value > maxValue) return;
				setStat( name, value );
				//change icon depending on the stat
				switch(name){
					case 'eat':
						animal.src = "img/eat.png";
						eatNotify = false;
						break;
					case 'cure':
						animal.src = "img/shower.png";
						cureNotify = false;
						break;
					case 'pet':
						animal.src = "img/laughing.png";
						petNotify = false;
						break;
					default:
						defaultMood();
				}
			}
		});
	}, 80);
}

//reset icon when user isn't doing anything
function defaultMood () {
	if (press || ded || sad) return;
	//draw random miliseconds to show random icons
	let miliseconds = Math.floor((Math.random() * (30 - 5) + 5) * 1000);
	changeIcon = setInterval(function(){
		let i = Math.floor(Math.random() * (waitingIcons.length - 0));
		let icon = waitingIcons[i];
		animal.src = `img/${icon}.png`;
	}, miliseconds);
	animal.src = "img/hello.png";
}

//decrease statistics in time
function decreaseStats() {
	reviveBtn.style.display = "none";
	called = setInterval (() => {
		Object.entries( statistics ).forEach( ( [ name, value ] ) => {
			value--;
			setStat( name, value );
		})
		checkMood();
	}, 1000);
}

window.addEventListener('load', () => {	
	//set initial statistics
	const stats = document.querySelectorAll('.stats input');	
	stats.forEach(stat => {
		let name = stat.id;
		let value = stat.value;
		setStat( name, value );
	});
	//run initial functions
	decreaseStats();
	defaultMood();
	Notification.requestPermission();

})

// buttons.forEach(button => button.addEventListener());
buttonsList.addEventListener('touchstart', takeCare, false);
document.addEventListener('touchend', stopCare, false);

}());