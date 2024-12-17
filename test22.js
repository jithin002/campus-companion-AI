const campusLocations = {
    "main-entrance": {
        coords: [12.66310058341341, 77.45108219697767],
        connections: ["soe-block", "library"]
    },
    "canteen": {
        coords: [12.660093409672044, 77.44977208523568],
        connections: ["ground", "library"]
    },
    "library": {
        coords: [12.661414708229671, 77.4505667313083],
        connections: ["canteen", "main-entrance"]
    },
    "soe-block": {
        coords: [12.662043035479599, 77.45078786016757],
        connections: ["ground", "library", "main-entrance"]
    },
    "cdsimer": {
        coords: [12.661089014477682, 77.44932948678678],
        floors: {
            0: { name: "Ground Floor", facilities: ["Labs", "Classrooms"] },
            1: { name: "First Floor", facilities: ["Faculty Rooms", "HOD Office"] }
        },
        connections: ["ground", "library"]
    },
    "bike-parking": {
        coords: [12.661995542452715, 77.4520483953466],
        floors: {},
        connections: ["cdsimer", "library"]
    },
    "cricket ground": {
        coords: [12.661595412352028, 77.45480005713375],
        floors: {},
        connections: ["cdsimer", "library"]
    },
    "arena": {
        coords: [12.65974350312608, 77.45317911321905],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "mechanical block": {
        coords: [12.662242441148692, 77.45190856809262],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "footbal ground": {
        coords: [12.661564658201215,77.45587944131341],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "basketball cort": {
        coords: [12.660555770162802, 77.4544817938908],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "tummy trails": {
        coords: [12.66033311404, 77.45247001008681],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "CDSIMER staff Quarters": {
        coords: [12.658829915926304, 77.45123581483324],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "car-parking": {
        coords: [12.660475919506453,  77.44842169765076],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "P-block(psychiatry block)": {
        coords: [12.659535981629901, 77.44917281555433],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "collage of physiotherapy": {
        coords: [12.658977675340111, 77.44947068168409],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "nurses quarters": {
        coords: [12.658449960051271, 77.44944716593704],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "girls hostel": {
        coords: [12.659092395910392, 77.44899252815998],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "boys hostel": {
        coords: [12.657960486889493, 77.44748568474506],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "lake view": {
        coords: [12.658274057576264, 77.44929639727314],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "hostel mess": {
        coords: [12.658116731553093, 77.44584557543772],
        floors: {},
        connections: ["cdsimer", "library"]
    }, "grains and gossip": {
        coords: [ 12.657787871574627, 77.44550852362386],
        floors: {},
        connections: ["cdsimer", "library"]
    },
    "food truck": {
        coords: [ 12.662439612948134, 77.45181240546168],
        floors: {},
        connections: ["cdsimer", "library"]
    },
    "Cafeteria": {
        coords: [  12.661208065207049, 77.44946500704174],
        floors: {},
        connections: ["cdsimer", "library"]
    },
    "emergency ward": {
        coords: [  12.660733825874402, 77.44931052339933],
        floors: {},
        connections: ["cdsimer", "library"]
    }
};

const map = L.map('map').setView([12.663240973675684, 77.45089895890169], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let startMarker = null;
let routingControl = null;
let userLocation = null;

// Locate the user and update the map
function locateUser(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLocation = [latitude, longitude];
                map.setView(userLocation, 17);

                if (!startMarker) {
                    startMarker = L.marker(userLocation)
                        .addTo(map)
                        .bindPopup("Your Location")
                        .openPopup();
                } else {
                    startMarker.setLatLng(userLocation);
                }

                console.log("User location:", userLocation);
                if (callback) callback(); // Trigger callback if needed
            },
            (error) => {
                alert(`Error: Unable to retrieve location (${error.message}).`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Speak directions using SpeechSynthesis API
function speakDirections(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
}

// Route to the selected destination
function routeToDestination(startCoords, endCoords) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startCoords),
            L.latLng(endCoords)
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: false,
        geocoder: L.Control.Geocoder.nominatim(),
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        if (routes.length > 0) {
            const summary = routes[0].summary;
            const text = `The route is approximately ${Math.round(summary.totalDistance / 1000)} kilometers and will take about ${Math.round(summary.totalTime / 60)} minutes.`;
            speakDirections(text);

            const directionsDiv = document.getElementById('directions');
            directionsDiv.innerHTML = `<p>${text}</p>`;
        }
    });

    routingControl.on('routingerror', function () {
        const errorText = "Unable to calculate the route. Please check your internet connection or try again later.";
        speakDirections(errorText);
        alert(errorText);
    });
}

// Handle navigation updates based on selected inputs
function handleNavigationUpdate() {
    const startLocation = document.getElementById('start-location').value || 'user-location';
    const destination = document.getElementById('destination').value;

    if (!destination) {
        const errorText = "Please select a destination.";
        speakDirections(errorText);
        alert(errorText);
        return;
    }

    let startCoords;

    if (startLocation === 'user-location') {
        if (!userLocation) {
            locateUser(() => handleNavigationUpdate()); // Retry after fetching user location
            return;
        }
        startCoords = userLocation;
    } else {
        startCoords = campusLocations[startLocation]?.coords;
    }

    const endCoords = campusLocations[destination]?.coords;

    if (!startCoords || !endCoords) {
        const errorText = "Invalid start location or destination selected.";
        speakDirections(errorText);
        alert(errorText);
        return;
    }

    routeToDestination(startCoords, endCoords);

    const directionsDiv = document.getElementById('directions');
    const statusText = `Routing from ${startLocation === 'user-location' ? 'current location' : startLocation} to ${destination}...`;
    directionsDiv.innerHTML = `<p>${statusText}</p>`;
    speakDirections(statusText);
}

// Event listeners
document.getElementById('destination').addEventListener('change', handleNavigationUpdate);
document.getElementById('start-location').addEventListener('change', handleNavigationUpdate);
document.getElementById('locate-btn').addEventListener('click', locateUser);

// Initialize user location on page load
locateUser();
