require([
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Feature",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (OAuthInfo, esriId, Map, MapView, FeatureLayer, Feature, BasemapGallery, Expand) {
    //Constants for the HTML div panels
    const personalPanelElement = document.getElementById("personalizedPanel");
    const anonPanelElement = document.getElementById("anonymousPanel");

    //OAuth constant linking to registered AGOL application and logging to Cobec portal
    const info = new OAuthInfo({
        appId: "KiHuSotTULGiKtfZ",
        portalUrl: "https://cobecconsulting.maps.arcgis.com",
        authNamespace: "portal_oauth_inline",
        flowtype: "auto",
        popup: false
    });

    esriId.registerOAuthInfos([info]);
    
    //Get AGOL credentials on startup
    esriId.getCredential(info.portalUrl + "/sharing");
    
    esriId.checkSignInStatus(info.portalUrl + "/sharing").then(() => {
        initializeApp();
    });/*.catch(() => {
        //If not signed in, display "sign-in" panel
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "none";
    });*/

    //Initialize new FeatureLayer constant
    const traconLayer = new FeatureLayer({
      // SITREP LAYER url: "https://services3.arcgis.com/rKjecbIat1XHvd9J/arcgis/rest/services/service_dfbfd13d17b54fe4bc253c22e8af0620/FeatureServer"
      portalItem: {
        id: "383ab9e4787c4f8db81bd54988142db0"
      },
      layerId: 0,
      outFields: ["*"]
    });

    //Initialize new Map constant
    const map = new Map({
      basemap: "arcgis-dark-gray",
      layers: [traconLayer]
    });

    //Initialize new MapView constant
    const view = new MapView ({
      container: "viewDiv",
      map: map,
      center: [-98.5795, 39.8283],
      zoom: 3,
      popup: {
        autoOpenEnabled: false
      }
    });

    function initializeApp() {
      //Change display to main app display
      anonPanelElement.style.display = "none";
      personalPanelElement.style.display = "block";
      addWidgets();
    }

    function addWidgets() {
        //Initialize Basemap Gallery widget
        const basemapGallery = new BasemapGallery({
            view: view
        });

        //Initialize Expand widget
        const expand = new Expand({
            view: view,
            content: basemapGallery
        });

        //Add Basemap Gallery widget to map view
        view.ui.add([expand], {
            position: "top-right"
        });
    }

    view.when().then(() => {
      // Create a default graphic for when the application starts
      const graphic = {
        popupTemplate: {
          content: "Mouse over features to show details..."
        }
      };

      // Provide graphic to a new instance of a Feature widget
      const feature = new Feature({
        container: "featureDetailsDiv",
        graphic: graphic,
        map: view.map,
        spatialReference: view.spatialReference
      });

      view.whenLayerView(traconLayer).then((layerView) => {
        let highlight;
        // listen for the pointer-move event on the View
        view.on("pointer-move", (event) => {
          // Perform a hitTest on the View
          view.hitTest(event).then((event) => {
            console.log("HIT");
            // Make sure graphic has a popupTemplate
            const results = event.results.filter((result) => {
              return result.graphic.layer.popupTemplate;
            });
            const result = results[0];
            highlight && highlight.remove();
            // Update the graphic of the Feature widget
            // on pointer-move with the result
            if (result) {
              feature.graphic = result.graphic;
              highlight = layerView.highlight(result.graphic);
            } else {
              feature.graphic = graphic;
            }
          });
        });
      });
    });
});