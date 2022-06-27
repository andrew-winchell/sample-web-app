require([
    "esri/portal/Portal",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (Portal, OAuthInfo, esriId, esriConfig, Map, MapView, FeatureLayer, BasemapGallery, Expand) {
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
    
    esriId.checkSignInStatus(INFO.portalUrl + "/sharing").then(() => {
        displayMap();
    });/*.catch(() => {
        //If not signed in, display "sign-in" panel
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "none";
    });*/
    
    //Get AGOL credentials on startup
    esriId.getCredential(INFO.portalUrl + "/sharing");

    function displayMap() {
        //Initialize the map
        const MAP = new Map({
            basemap: "arcgis-dark-gray"
        });
        
        //Display main app html element
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "block";

        addWidgets(MAP);
        addLayers(MAP);
    }

    function addWidgets(map) {
        //Set the map view
        const VIEW = new MapView({
            container: "viewDiv",
            map: map,
            center: [-88, 44],
            zoom: 4
        });

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

    function addLayers(map) {
      const MASTERLAYER = new FeatureLayer({
        // SITREP LAYER url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_dfbfd13d17b54fe4bc253c22e8af0620/FeatureServer"
        url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_f02b435f02d74f4c94d3dc28796b84f8/FeatureServer"
      }).addTo(map);
    }

});