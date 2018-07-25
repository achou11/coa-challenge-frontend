// GeoJSON layer with dog info
var layer = {
  'type': 'FeatureCollection',
  'features': [] // Populate with info from API
}

// This is still flawed but gets most of it right
function getDogInfo (description) {
  let descriptionClean = description.replace(/[^a-z\d," -.,()/]/ig, '\"')
  let infoArray = descriptionClean.split('"').slice(1)
  let genderInfo = infoArray[1].slice(0, infoArray[1].indexOf(',')).trim().split(' ')
  let colorAndBreedInfo = infoArray[1].slice(infoArray[1].indexOf(',') + 1).trim()

  let name = infoArray[0].replace(/[^a-z\d ]/gi, '')
  let color = colorAndBreedInfo.slice(0, colorAndBreedInfo.search(/[A-Z]/)).trim()
  let breed = colorAndBreedInfo.slice(colorAndBreedInfo.search(/[A-Z]/)).replace('  ', ' ')
  let status
  let gender

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
    'name': name,
    'status': status,
    'gender': gender,
    'color': color,
    'breed': breed
  }
}

function createPointFeature (data) {
  let dogInfo = getDogInfo(data.description_of_dog)

  let point = {
    'type': 'Feature',
    'geometry': data.location,
    'properties': {
      'ownerFirstName': data.first_name.trim(),
      'ownerLastName': data.last_name.trim(),
      'address': data.address.trim(),
      'dogName': dogInfo.name,
      'dogStatus': dogInfo.status,
      'dogGender': dogInfo.gender,
      'dogColor': dogInfo.color,
      'dogBreed': dogInfo.breed
    }
  }

  return point
}

export function getData (url, callback, render) {
  fetch(url)
    .then(resp => resp.json()).catch(err => console.error(err))
    .then(data => {
      callback(data, render)
    })

    /* Equivalent of above using traditional XHR
    let request = new XMLHttpRequest()
      request.onreadystatechange = () => {
         if (request.readyState === 4 && request.status === 200) {
          callback(request.response)
        }
      }
    request.open('GET', url, true)
    request.responseType = 'json'
    request.send(null)
    */
}

export function processData (data, render) {
  if (data) {
    data.forEach(d => {
      // Only uses data with associated coordinates
      // If coordinates are undefined, it will not be mapped
      if (d.location) {
        layer.features.push(createPointFeature(d))
      }
    })

    render(layer)
  }
}
