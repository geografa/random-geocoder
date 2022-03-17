'use strict';
const mapboxgl = require('mapbox-gl');
const geocodingClient = require('@mapbox/mapbox-sdk/services/geocoding');
const turf = require('@turf/random');

const accessToken = 'pk.eyJ1IjoiZ3JhZmEiLCJhIjoiY2pxbjFhMTg1MDJ2MzQ0bXJpZ2c5NjM3eCJ9.XDmc8knZy11F1omDy_P22w';
const baseClient = geocodingClient({ accessToken: accessToken});

mapboxgl.accessToken = accessToken;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/grafa/cjlpdxg937l1b2rofobsv14ue',
    center: [-122.67143949070442,45.54722707150694],
    zoom: 11
});

// start with getting a set of random points with turf
function findBounds(cb) {
    let numAddresses = document.getElementById('numAddresses').value;
    coords = []; // empty it each time
    let bounds = map.getBounds().toArray().flat();
    // make 3 coordinates
    let controls = turf.randomPoint(numAddresses, {bbox: bounds});
    // geocode them
    controls.features.forEach(function(control, index) {
        coords.push(control.geometry.coordinates);
        baseClient
            .reverseGeocode({
                query: control.geometry.coordinates,
                limit: 1,
                mode:'mapbox.places'
            })
            .send()
            .then(response => {
                const match = response.body;
                // add them to the form
                document.getElementById('addresses').innerHTML += match.features[0].place_name + '\n';
                controls.features[index].properties = match.features[0].properties;
                console.log(match.features[0].properties);
            });
    });
    cb(controls);
}
let coords = [];
  
function showStops(controls) {
    if (map.getSource('controls')) {
        map.getSource('controls').setData(controls)
    } else {
        // console.log(controls);
        map.addSource('controls', {
            'type': 'geojson',
            'data': controls
        });
        map.addLayer({
            'id': 'controls',
            'type': 'circle',
            'source': 'controls',
            'paint': {
                'circle-radius': {
                    'base': 1.75,
                    'stops': [
                        [12, 8],
                        [22, 180]
                    ]
                },
                'circle-color': [
                    "match",
                    ["get", "accuracy"],
                    ["interpolated"],
                    "hsl(23, 88%, 65%)",
                    ["street"],
                    "hsl(52, 92%, 56%)",
                    ["parcel"],
                    "hsl(207, 80%, 67%)",
                    ["point"],
                    "hsl(150, 88%, 68%)",
                    ["rooftop"],
                    "hsl(50, 63%, 31%)",
                    "#000000"
                  ]
            }
        });
    }
}

document.getElementById('goButton').onclick = function() {findBounds(showStops)};
