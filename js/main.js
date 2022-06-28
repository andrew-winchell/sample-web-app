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

    //OAuth constant linking to registered AGOL application and logging to Cobec portal
    const INFO = new OAuthInfo({
        appId: "KiHuSotTULGiKtfZ",
        portalUrl: "https://cobecconsulting.maps.arcgis.com",
        authNamespace: "portal_oauth_inline",
        flowtype: "auto",
        popup: false
    });

    esriId.registerOAuthInfos([INFO]);
    
    //Get AGOL credentials on startup
    esriId.getCredential(INFO.portalUrl + "/sharing");
    
    esriId.checkSignInStatus(INFO.portalUrl + "/sharing").then(() => {
        initializeApp();
    });/*.catch(() => {
        //If not signed in, display "sign-in" panel
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "none";
    });*/

    function initializeApp() {
      //Change display to main app display
      anonPanelElement.style.display = "none";
      personalPanelElement.style.display = "block";

      //Initialize new FeatureLayer constant
      const LAYER = new FeatureLayer({
        portalItem: {
          id: "383ab9e4787c4f8db81bd54988142db0"
        },
        // SITREP LAYER url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_dfbfd13d17b54fe4bc253c22e8af0620/FeatureServer"
        //url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_f02b435f02d74f4c94d3dc28796b84f8/FeatureServer",
        outFields: ["*"]
      });

      //Initialize new Map constant
      const MAP = new Map({
        basemap: "arcgis-dark-gray",
        layers: [LAYER]
      });

      //Initialize new MapView constant
      const VIEW = new MapView ({
        container: "viewDiv",
        map: MAP,
        center: [-98.5795, 39.8283],
        zoom: 3
      });

      const graphic = {
        popupTemplate: {
          content: "Origination Content"
        }
      };

      const feature = new Feature({
        graphic: graphic,
        map: VIEW.map,
        spatialReference: VIEW.spatialReference
      });

      VIEW.ui.add(feature, "bottom-left");

      addWidgets(MAP);
    }

    function addWidgets(map) {
        //Initialize Basemap Gallery widget
        const BASEMAPGALLERY = new BasemapGallery({
            view: VIEW
        });

        //Initialize Expand widget
        const EXPAND = new Expand({
            view: VIEW,
            content: BASEMAPGALLERY
        });

        //Add Basemap Gallery widget to map view
        VIEW.ui.add([EXPAND], {
            position: "top-right"
        });
    }
});