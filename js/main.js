require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView"
], function (esriConfig, Map, MapView) {

    //Developer Dashboard ArcGIS API Key
    esriConfig.apiKey = "AAPK0d997cff573e4a00a21f46b5ce9dd0fcDEvU_DalfJdwLqQjyVLb-gt9N5lFcLwfbzVwV9egBdIDWBtpYrgh_I8idfMduczS";

    //Initialize the map
    const MAP = new Map({
        basemap: "arcgis-dark-gray"
    });

    //Set the map view
    const VIEW = new MapView({
        container: "viewDiv",
        map: MAP,
        center: [-88, 44],
        zoom: 7
    })
});