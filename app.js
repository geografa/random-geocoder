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
    // make seven coordinates
    let controls = turf.randomPoint(numAddresses, {bbox: bounds});
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
                document.getElementById('addresses').innerHTML += match.features[0].place_name + '\n';
            });  
    });
    cb(controls);
}
let coords = [];
function makeAddresses() {
    findBounds(showStops);
}

function showStops(controls) {
    if (map.getSource('controls')) {
        map.getSource('controls').setData(controls)        
    } else {
        map.addSource('controls', {
            'type': 'geojson',
            'data': controls
        });
        map.addLayer({
            'id': 'controls',
            'type': 'symbol',
            'source': 'controls',
            'layout': {
                'icon-image': 'dot-blue',
                'icon-allow-overlap': true
            }
        });
    }
}

document.getElementById('goButton').onclick = function() {makeAddresses()};
