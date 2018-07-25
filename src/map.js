import { config } from './config.js'

L.MakiMarkers.accessToken = config.mapboxToken

var dogIconDefault = L.MakiMarkers.icon({
  icon: 'dog-park',
  color: '#eb2e2e',
  size: 's'
})

var dogIconSelected = L.MakiMarkers.icon({
  icon: 'dog-park',
  color: '#ff6600',
  size: 'l'

})

function createDogIcon (state) {
  let color, size
  if (state === 'default') {
    color = '#eb2e2e'
    size = 's'
  } else if (state === 'selected') {
    color = '#ff6600'
    size = 'l'
  }

  return L.MakiMarkers.icon({
    icon: 'dog-park',
    color: color,
    size: size
  })
}

function getAllMarkers (layers) {
  let markers = Object.keys(layers).filter(l => {
    return layers[l].hasOwnProperty('_icon')
  }).map(l => {
    return layers[l]
  })

  return markers
}

function clearHighlightedMarkers (layers) {
  let markers = getAllMarkers(layers)
  markers.forEach(m => m.setIcon(createDogIcon('default')))
}

export function renderMap (layer) {
  let layerUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + config.mapboxToken
  let attributionText = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contr' +
        'ibutors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
        ' Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

  var map = L 
    .map('map').setView([30.267153, -97.7430608], 10)

  L
    .tileLayer(layerUrl, {
      attribution: attributionText,
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: config.mapboxToken
    })
    .addTo(map)

  L
    .geoJSON(layer, {
      pointToLayer: (feature, latlng) => {
        if (feature.properties) {
          let props = feature.properties

          let marker = L.marker(latlng, {
            icon: createDogIcon('default'),
            title: props.dogName,
            alt: 'Dog Marker',
            riseOnHover: true
          })

          marker.on('click', e => {
            clearHighlightedMarkers(map._layers)

            // center view on clicked feature
            map.setView(e.target.getLatLng(), 11)

            // Highlight clicked marker
            e.target.setIcon(createDogIcon('selected'))
          })

          return marker
        }
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          let props = feature.properties

          layer.bindPopup(
            `
            <h3 class="title">${props.dogName}</h3>
            <p class="content">
              A ${props.dogColor} ${props.dogBreed}. 
              ${props.dogName} belongs to ${props.ownerFirstName} ${props.ownerLastName}.
            </p>
            `
          )
        }
      }
    })
    .addTo(map)

  /*
  L
    .control
    .zoom({
      position: 'bottomleft'
    })
    .addTo(map)
  */
  map.on('click', e => {
    clearHighlightedMarkers(e.target._layers)
  })

  return Map
}
