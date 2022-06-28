require([
    "esri/core/promiseUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Feature",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (promiseUtils, OAuthInfo, esriId, WebMap, MapView, FeatureLayer, Feature, BasemapGallery, Expand) {
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
      portalItem: {
        id: "383ab9e4787c4f8db81bd54988142db0"
      }
    });

    //Initialize new Map constant
    const map = new WebMap({
      portalItem: {
        id: "530b9377d7444fa99bb26ca01a990519"
      },
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
        let objectId;

        const debouncedUpdate = promiseUtils.debounce((event) => {
          // Perform a hitTest on the View
          view.hitTest(event).then((event) => {
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

        // Listen for the pointer-move event on the View
        // and make sure that function is not invoked more
        // than one at a time
        view.on("pointer-move", (event) => {
          debouncedUpdate(event).catch((err) => {
            if (!promiseUtils.isAbortError(err)) {
              throw err;
            }
          });
        });
      });
    });
});