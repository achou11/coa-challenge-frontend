/* Represents functions that are works in progress */

import { config } from './config.js'

/** For handling features that have coordinates
 * It accesses the OpenCage geocoding API to find a lng, lat coordinate to use for the feature
 * example of location parameter: {address: ['3415', 'Sweetgum', 'Trc'], state: 'TX'}
 */
export function geocode (location, callback) {
  // params
  // {address: ['3415', 'Sweetgum', 'Trc'], state: 'TX' }

  let apiKey = config.openCageKey
  let baseUrl = 'https://api.opencagedata.com/geocode/v1/'
  let atxLatLng = '30.2672%C+-97.7431'
  let endPoint = `
    ${baseUrl}?key=${apiKey}&q=${location.address.join('+') + ',+' + location.state}&format=json&pretty=1
    `

  fetch(endPoint)
    .then(resp => resp.json()).catch(err => console.error(err))
    .then(data => {
      callback(data)
    })

    /*
    let request = new XMLHttpRequest()

    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        console.log(request.response)
        callback(request.response)
      }
    }

    request.open('GET', endPoint, true)
    request.responseType = 'json'
    request.send = null
    */
}

// Returns the coordinates provided by the OpenCage API response
export function getLatLng (data) {
  if (data) {
    // Uses the result with the greatest confidence
    let lng = data.results[0].geometry.lng
    let lat = data.results[0].geometry.lat

    console.log(lng)
    console.log(lat)

    return [lng, lat]
  }
}
