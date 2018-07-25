import { settings } from './settings.js'

// GeoJSON layer with dog info
var layer = {
  "type": "FeatureCollection",
  "features": [] // Populate with info from API
}

getData('https://data.austintexas.gov/resource/h8x4-nvyi.json', processData)


function getData(url, callback) {
  let request = new XMLHttpRequest();
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
      callback(request.response)
    }
  }

  request.open('GET', url, true)
  request.responseType = 'json'

  request.send(null)
}

function processData(data) {
  if (data) {
    data.forEach(d => {
      layer
        .features
        .push(createPointFeature(d))
    })

    renderMap()
  }
}

// This is still flawed but gets most of it right
function getDogInfo(description) {
  let descriptionClean = description.replace(/[^a-z\d," -.,()/]/ig, '\"')
  let infoArray = descriptionClean.split('"').slice(1)
  let genderInfo = infoArray[1].slice(0, infoArray[1].indexOf(',')).trim().split(' ')
  let colorAndBreedInfo = infoArray[1].slice(infoArray[1].indexOf(',') + 1).trim()

  let name = infoArray[0].replace(/[^a-z\d ]/gi, '')
  let color = colorAndBreedInfo.slice(0, colorAndBreedInfo.search(/[A-Z]/)).trim()
  let breed = colorAndBreedInfo.slice(colorAndBreedInfo.search(/[A-Z]/)).replace('  ', ' ')
  let status;
  let gender;

  if (genderInfo.length === 1) {
    if (['male', 'female'].includes(genderInfo[0].toLowerCase())) {
      status = null
      gender = genderInfo[0]
    } else if (['neutered', 'spayed'].includes[genderInfo[0].toLowerCase()]) {
      status = genderInfo[0]
      gender = null
    }
  } else {
    status = genderInfo[0]
    gender = genderInfo[1]
  }

  return {
    "name": name,
    "status": status,
    "gender": gender,
    "color": color,
    "breed": breed,
  }
}

function createPointFeature(data) {
  let dogInfo = getDogInfo(data.description_of_dog)

  let point = {
    "type": "Feature",
    "geometry": data.location ?
      data.location : {
        "type": "Point",
        "coordinates": [-97, 30]
      },
    "properties": {
      "ownerFirstName": data.first_name.trim(),
      "ownerLastName": data.last_name.trim(),
      "address": data.address.trim(),
      "dogName": dogInfo.name,
      "dogStatus": dogInfo.status,
      "dogGender": dogInfo.gender,
      "dogColor": dogInfo.color,
      "dogBreed": dogInfo.breed
    }
  }

  return point
}

L.MakiMarkers.accessToken = settings.mapboxToken

var dogIcon = L.MakiMarkers.icon({
  icon: "dog-park",
  color: "#eb2e2e",
  size: "s",
  popupAnchor: [0, 30],
})

var dogIconSelected = L.MakiMarkers.icon({
  icon: "dog-park",
  color: "#ff6600",
  size: "s",
  popupAnchor: [0, 30],
})

function renderMap() {
  let layerUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + settings.mapboxToken
  let attributionText = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contr' +
    'ibutors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
    ' Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

  var map = L
    .map('map', {
      zoomControl: false
    })
    .setView([
      30.267153, -97.7430608
    ], 10);

  L
    .tileLayer(layerUrl, {
      attribution: attributionText,
      maxZoom: 18,
      id: 'mapbox.light',
      accessToken: settings.mapboxToken
    })
    .addTo(map);

  L
    .geoJSON(layer, {
      pointToLayer: (feature, latlng) => {
        if (feature.properties) {
          let props = feature.properties

          let marker = L.marker(latlng, {
            icon: dogIcon,
            title: props.dogName,
            alt: "Dog Marker"
          })

          marker.on('click', e => {
            console.log(e.target)

            clearHighlightedMarkers(map._layers)

            // Highlight clicked marker
            e.target.setIcon(dogIconSelected)
          })

          return marker
        }
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          let props = feature.properties

          layer.bindPopup(
            `
            <h3>${props.dogName}</h3>
            <p>${props.dogBreed}</p>
            <p>${props.dogColor}</p>
            `
          )
        }
      }
    })
    .addTo(map)

  L
    .control
    .zoom({
      position: 'bottomleft'
    })
    .addTo(map)


  map.on('click', e => {
    clearHighlightedMarkers(e.target._layers)
  })

  return Map
}

function removeHighlight() {
  let markers = document.querySelectorAll('.leaflet-marker-icon')

  markers.forEach(m => {
    if (m.classList.contains('highlight')) {
      m.remove('highlight')
    }
  })
}

function getAllMarkers(layers) {

  let markers = Object.keys(layers).filter(l => {
    return layers[l].hasOwnProperty('_icon')
  }).map(l => {
    return layers[l]
  })

  return markers
}

function clearHighlightedMarkers(layers) {
  let markers = getAllMarkers(layers)
  markers.forEach(m => m.setIcon(dogIcon))
}