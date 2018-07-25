'use strict;'

import { renderMap } from './src/map.js'
import { getData, processData } from './src/data.js'

var dataUrl = 'https://data.austintexas.gov/resource/h8x4-nvyi.json'

getData(dataUrl, processData, renderMap)
