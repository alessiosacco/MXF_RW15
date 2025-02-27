import StadiaMaps from 'ol/source/StadiaMaps.js';
import TileLayer from 'ol/layer/Tile.js';
import {Circle, Fill, Style, Stroke} from 'ol/style.js';
import {Map, View} from 'ol/index.js';
import {Point, Polygon, LineString} from 'ol/geom.js';
import {getVectorContext} from 'ol/render.js';
import {upAndDown} from 'ol/easing.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

function feet_to_meters(feet) {
  return 0.3048 * feet;
}

function PointFromBearingAndDistance(coordsDeg, headingDeg, distanceM) {
  const lonDeg = coordsDeg[0];
  const latDeg = coordsDeg[1];

  const latRad = (latDeg / 180.0) * Math.PI;
  const lonRad = (lonDeg / 180.0) * Math.PI;
  var headingRad = (headingDeg / 180.0) * Math.PI;
  if (headingRad > Math.PI * 2) {
    headingRad -= 2 * Math.PI;
  }

  var latRad2 = latRad * 2;
  if (latRad2 > Math.PI * 2) {
    latRad2 -= 2 * Math.PI;
  }

  const m_per_deg_lat =
    111132.954 - 559.822 * Math.cos(2 * latRad) + 1.175 * Math.cos(4 * latRad);
  const m_per_deg_lon = 111132.954 * Math.cos(latRad);

  const latDeltaM = Math.cos(headingRad) * distanceM;
  const lonDeltaM = Math.sin(headingRad) * distanceM;

  const latDeltaDeg = latDeltaM / m_per_deg_lat;
  const lonDeltaDeg = lonDeltaM / m_per_deg_lon;

  return [lonDeg + lonDeltaDeg, latDeg + latDeltaDeg];
}

let runway_15 = {
  lat: 52.171474965289235,
  lon: 20.94671381637454,
  coord: [20.94671381637454, 52.171474965289235],
  bearing: 114.52,
  width: feet_to_meters(164.0),
  length: feet_to_meters(9186.0),
};

let runway_15_front = runway_15.coord;
let runway_15_back = PointFromBearingAndDistance(
  runway_15.coord,
  runway_15.bearing,
  runway_15.length,
);
let runway_15_extended = PointFromBearingAndDistance(
  runway_15.coord,
  runway_15.bearing - 180.0,
  runway_15.length + 30000,
);

let ils = {
  lat: 52.16061109676957,
  lon: 20.98541658371687,
  coord: [20.98541658371687, 52.16061109676957],
  bearing: 114.52,
};

let ils_1 = PointFromBearingAndDistance(
  ils.coord,
  ils.bearing + 180.0 + 0.7,
  18520,
);
let ils_2 = PointFromBearingAndDistance(
  ils.coord,
  ils.bearing + 180.0 - 0.7,
  18520,
);
let ils_3 = PointFromBearingAndDistance(ils.coord, ils.bearing + 180.0, 18520);

let gls = {
  lat: 52.171166595071554,
  lon: 20.951638855040073,
  coord: [20.951638855040073, 52.171166595071554],
  bearing: 114.0,
};

const layer = new TileLayer({
  source: new StadiaMaps({
    layer: 'alidade_satellite',
  }),
});

const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: runway_15_front,
    zoom: 15,
    // rotation: ((270.0 - 148.0) / 180.0) * Math.PI,
  }),
});

const redPointStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({color: 'rgb(255, 0, 0)'}),
  }),
});
const greenPointStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({color: 'rgb(0, 255, 0)'}),
  }),
});
const bluePointStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({color: 'rgb(0, 0, 255)'}),
  }),
});
const orangePointStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({color: 'rgb(255, 102, 0)'}),
  }),
});
const bluePolygonStyle = new Style({
  stroke: new Stroke({
    color: 'blue',
    width: 3,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.5)',
  }),
});
const greenPolygonStyle = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 3,
  }),
  fill: new Fill({
    color: 'rgba(0, 255, 0, 0.2)',
  }),
});

const geos = new Array();
geos.push({
  point: new Point(runway_15_front),
  style: greenPointStyle,
});
geos.push({
  point: new Point(runway_15_back),
  style: greenPointStyle,
});
geos.push({
  point: new Point(
    PointFromBearingAndDistance(
      runway_15_front,
      runway_15.bearing + 90.0,
      runway_15.width,
    ),
  ),
  style: redPointStyle,
});
geos.push({
  point: new Point(
    PointFromBearingAndDistance(
      runway_15_front,
      runway_15.bearing - 90.0,
      runway_15.width,
    ),
  ),
  style: redPointStyle,
});
geos.push({
  point: new Point(
    PointFromBearingAndDistance(
      runway_15_back,
      runway_15.bearing + 90.0,
      runway_15.width,
    ),
  ),
  style: redPointStyle,
});
geos.push({
  point: new Point(
    PointFromBearingAndDistance(
      runway_15_back,
      runway_15.bearing - 90.0,
      runway_15.width,
    ),
  ),
  style: redPointStyle,
});
geos.push({
  point: new Point(ils.coord),
  style: bluePointStyle,
});
geos.push({
  point: new Point(gls.coord),
  style: orangePointStyle,
});
geos.push({
  point: new Polygon([[ils.coord, ils_1, ils_2, ils.coord]]),
  style: bluePolygonStyle,
});
geos.push({
  point: new LineString([runway_15_back, runway_15_extended]),
  style: greenPolygonStyle,
});
geos.push({
  point: new LineString([ils.coord, ils_3]),
  style: bluePolygonStyle,
});

layer.on('postrender', function (event) {
  const vectorContext = getVectorContext(event);

  for (let i = 0; i < geos.length; ++i) {
    let element = geos[i];
    vectorContext.setStyle(element.style);
    vectorContext.drawGeometry(element.point);
  }

  map.render();
});
