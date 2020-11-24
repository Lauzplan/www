<template>
  <div>
    <link
      href="https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css"
      rel="stylesheet"
    />
    <v-row>
      <v-col>
        <div id="mapid3" class="map"></div>
      </v-col>
      <v-col>
        <div id="mapid4" class="map"></div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="mapid2" class="map"></div>
      </v-col>
      <v-col>
        <div id="mapid" class="map"></div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapboxgl from 'mapbox-gl'
import 'ol/ol.css'
import { Map, View } from 'ol'
import BingMaps from 'ol/source/BingMaps'
import TileLayer from 'ol/layer/Tile'
import { FullScreen, defaults as defaultControls } from 'ol/control'
// import OSM from 'ol/source/OSM'
export default {
  mounted() {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZ3VpbGxhdW1lZGVtb2ZmIiwiYSI6ImNraGwxNnNqeDI4ZWcyc2w2bGFtc2oxZDkifQ.RcIwnI9pW87QjBsmX-KCjw'

    // eslint-disable-next-line no-unused-vars
    const map = new mapboxgl.Map({
      container: 'mapid2',
      style: 'mapbox://styles/guillaumedemoff/ckhl1fccp05ua19m9k0hyak5z',
    })

    const mymap = L.map('mapid').setView([51.505, -0.09], 13)
    L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    ).addTo(mymap)
    L.tileLayer(
      'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}',
      {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png',
      }
    ).addTo(mymap)

    const mymap3 = L.map('mapid3').setView([51.505, -0.09], 13)

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'guillaumedemoff/ckhl1fccp05ua19m9k0hyak5z',
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          'pk.eyJ1IjoiZ3VpbGxhdW1lZGVtb2ZmIiwiYSI6ImNraGwxNnNqeDI4ZWcyc2w2bGFtc2oxZDkifQ.RcIwnI9pW87QjBsmX-KCjw',
      }
    ).addTo(mymap3)

    // eslint-disable-next-line no-unused-vars
    const map4 = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      target: 'mapid4',
      layers: [
        new TileLayer({
          source: new BingMaps({
            key:
              'Am54icn65BLsfH0vTCqv87ukOj9rmE1DorjqkBek1JNVjOtSGRobfDPaMhokrOx2',
            imagerySet: 'AerialWithLabelsOnDemand',
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    })
  },
}
</script>
<style scoped>
.map {
  height: 500px;
}
</style>
