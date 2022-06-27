require([
  "esri/core/promiseUtils",
    "esri/portal/Portal",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Feature",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (promiseUtils, Portal, OAuthInfo, esriId, esriConfig, Map, MapView, FeatureLayer, Feature, BasemapGallery, Expand) {
    //Constants for the HTML div panels
    const personalPanelElement = document.getElementById("personalizedPanel");
    const anonPanelElement = document.getElementById("anonymousPanel");
    const userIdElement = document.getElementById("userId");
  
    //Initialize the map
    const MAP = new Map({
    basemap: "arcgis-dark-gray"
    });

    //Set the map view
    const VIEW = new MapView({
        container: "viewDiv",
        map: MAP,
        center: [-88, 44],
        zoom: 4
    });
    
    const MASTERLAYER = new FeatureLayer({
      // SITREP LAYER url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_dfbfd13d17b54fe4bc253c22e8af0620/FeatureServer"
      url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_f02b435f02d74f4c94d3dc28796b84f8/FeatureServer",
      outFields: ["*"]
    });

    //OAuth constant linking to registered AGOL application and logging to Cobec portal
    const INFO = new OAuthInfo({
        appId: "KiHuSotTULGiKtfZ",
        portalUrl: "https://cobecconsulting.maps.arcgis.com",
        authNamespace: "portal_oauth_inline",
        flowtype: "auto",
        popup: false
    });

    esriId.registerOAuthInfos([INFO]);
    
    esriId.checkSignInStatus(INFO.portalUrl + "/sharing").then(() => {
        displayMap(MAP, VIEW, MASTERLAYER);
    });/*.catch(() => {
        //If not signed in, display "sign-in" panel
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "none";
    });*/
    
    //Get AGOL credentials on startup
    esriId.getCredential(INFO.portalUrl + "/sharing");

    function displayMap(map, view, fLayer) {
        //Display main app html element
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "block";

        addWidgets(map, view);
        addLayers(map, fLayer);
    }

    function addWidgets(map, view) {

        //Initialize Basemap Gallery widget
        const BASEMAPGALLERY = new BasemapGallery({
            view: view
        });

        //Initialize Expand widget
        const EXPAND = new Expand({
            view: view,
            content: BASEMAPGALLERY
        });

        //Add Basemap Gallery widget to map view
        view.ui.add([EXPAND], {
            position: "top-right"
        });
    }

    function addLayers(map, fLayer) {

      //MASTERLAYER.refreshInterval = 0.1;
      map.add(fLayer);
    }

    const graphic = {
      popupTemplate: {
        content: "Mouse over features to show details..."
      }
    };

    const feature = new Feature({
      graphic: graphic,
      map: VIEW.map,
      spatialReference: VIEW.spatialReference
    });

    VIEW.ui.add(feature, "bottom-left");

    VIEW.whenLayerView().then((layerView) => {
      let highlight;
      let objectId;

      const debouncedUpdate = promiseUtils.debounce((event) => {
        // Perform a hitTest on the View
        VIEW.hitTest(event).then((event) => {
          // Make sure graphic has a popupTemplate
          const results = event.results.filter((result) => {
            return result.graphic.layer.popupTemplate;
          });

          const result = results[0];
          const newObjectId =
            result && result.graphic.attributes[fLayer.objectIdField];

          if (!newObjectId) {
            highlight && highlight.remove();
            objectId = feature.graphic = null;
          } else if (objectId !== newObjectId) {
            highlight && highlight.remove();
            objectId = newObjectId;
            feature.graphic = result.graphic;
            highlight = layerView.highlight(result.graphic);
          }
        });
      });

      VIEW.on("pointer-move", (event) => {
        debouncedUpdate(event).catch((err) => {
          if (!promiseUtils.isAbortError(err)) {
            throw err;
          }
        });
      });
    });
});