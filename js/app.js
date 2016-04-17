"use strict";

/* ======= Model ======= */
var museums = [
    {
    	name: 'Adler Planetarium',
    	lat: 41.8663,
    	lng: -87.6068
    },
	{
		name: 'Art Institute of Chicago',
		lat: 41.8794,
		lng: -87.6239
	},
    {
    	name: 'Arts Club of Chicago',
    	lat: 41.8931,
    	lng: -87.6224
    },
    {
    	name: 'Chicago Children\'s Museum',
    	lat: 41.8914,
    	lng: -87.6092
    },
    {
    	name: 'Chicago Design Museum',
    	lat: 41.8835,
    	lng: -87.6292
    },
    {
		name: 'DuSable Museum of African American History',
		lat: 41.7918,
		lng: -87.6071
	},
    {
    	name: 'Field Museum of Natural History',
    	lat: 41.8663,
    	lng: -87.6170
    },
    {
    	name: 'Loyola University Museum of Art',
    	lat: 41.8974,
    	lng: -87.6254
    },
    {
    	name: 'Museum of Contemporary Art, Chicago',
    	lat: 41.8972,
    	lng: -87.6212
    },
    {
    	name: 'Museum of Contemporary Photography',
    	lat: 41.8742,
    	lng: -87.6244
    },
    {
    	name: 'Museum of Science and Industry (Chicago)',
    	lat: 41.7923,
    	lng: -87.5804
    },
    {
    	name: 'National Museum of Mexican Art',
    	lat: 41.8562,
    	lng: -87.6729
    },
    {
    	name: 'Peggy Notebaert Nature Museum',
    	lat: 41.9268,
    	lng: -87.6353
    },
    {
    	name: 'Shedd Aquarium',
    	lat: 41.8676,
    	lng: -87.6140
    },
    {
    	name: 'Smart Museum of Art',
    	lat: 41.7936,
    	lng: -87.6002
    },
    {
    	name: 'Swedish American Museum',
    	lat: 41.9767,
    	lng: -87.6680
    },
    {
    	name: 'University of Chicago Oriental Institute',
    	lat: 41.7892,
    	lng: -87.5975
    }
];


/* ======= Octopus ======= */
function octopus(map) {
	var self = this; //alias for this
	var infowindow = new google.maps.InfoWindow();

	//Marker constructor
	var Pin = function (map, museumName, markerlat, markerlng) {

	    this.name = ko.observable(museumName);
	    this.lat  = ko.observable(markerlat);
	    this.lng  = ko.observable(markerlng);

	    this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(markerlat, markerlng),
			animation: google.maps.Animation.DROP,
			map: map
	    });
	};

	//Close infowindow when map is clicked
	google.maps.event.addListener(map, 'click', function() {
		infowindow.close();
	});

	//Create marker for each location
	for (var i = 0 ; i < museums.length; i++) {

	    //Add pin/marker property to each location
	    museums[i].pin =  new Pin (map, museums[i].name, museums[i].lat, museums[i].lng);

	    //Heading for the individual marker
		var heading = museums[i].pin.name();

		//Open and populate infowindow, bounce marker when clicked
		google.maps.event.addListener(museums[i].pin.marker, 'click', (function(pin, infowindow, heading) {

				return function() {
					// Call Wiki link and add it to infowindow
					self.wikiRequest(heading, infowindow);
					infowindow.open(map, pin.marker);

					//Bounce marker when clicked
					pin.marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function() {
						pin.marker.setAnimation(null);
					}, 750);
				};
		})(museums[i].pin, infowindow, heading));
	}

	self.places = ko.observableArray(museums);
	self.visiblePlaces = ko.observableArray();
	self.query = ko.observable('');

	//Search bar filter, returns visiblePlaces array
	self.search = ko.computed(function() {

		//Clear array of visible museums
		self.visiblePlaces.removeAll();
		var filter = self.query().toLowerCase();

		//Loop through each item in self.places
		ko.utils.arrayFilter(self.places(), function(place) {

			var searchIndex = place.name.toLowerCase().indexOf(filter);

			if (searchIndex >= 0) {
				//If museum is found, show pin
				place.pin.marker.setVisible(true);

				//Push museum to visiblePlaces array
				self.visiblePlaces.push(place);

			} else {
				//Hide pin
				place.pin.marker.setVisible(false);
			}
		});

		//Return visiblePlaces
		return self.visiblePlaces();
	});


	//Click handler for sidebar/nav listing
	self.listItem = function(item) {

		//Get marker of clicked item
		var markerClicked = item.pin.marker;

		//Generate click event for the marker
		google.maps.event.trigger(markerClicked, 'click');
	}


	//MediaWiki Web API
	//https://en.wikipedia.org/w/api.php
	self.wikiRequest = function(heading, infowindow) {

		var museumName = heading;
		var wikiAPIurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + heading + '&limit=1&redirects=return&format=json';

		//Error handling
		var wikiRequestTimeout = setTimeout(function() {
			infowindow.setContent('<h2>' + heading + '</h2><p>Check back soon to read more about ' + heading + ' on Wikipedia. The resource is not available at this time.</p>');
		}, 6000);

		$.ajax({
			url: wikiAPIurl,
			dataType: 'jsonp',
			success: function(data) {
				var locationName =data[1];
				var locationBlurb = data[2];
				var locationUrl = data[3];

				infowindow.setContent('<h2>' + locationName + '</h2><p>' + locationBlurb + '</p><p>Read more about <a href="' + locationUrl + '">' + heading + '</a> on Wikipedia.</p>');

				clearTimeout(wikiRequestTimeout);
			}
		});
	};
}
//TODO: add museum address, phone, work hours, website, reviews?

/* ======= View ======= */
//Draw map once Google API is loaded
function initMap() {
    var map;
    // creates a new map instance
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.8794, lng: -87.6239},
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });
    ko.applyBindings(new octopus(map));
}

//Error handling for Google API
function noMap() {
    alert('It appears we have lost connecton to Google Maps.');
    console.log('Google map error');
}