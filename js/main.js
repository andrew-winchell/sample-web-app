require([
    "esri/core/promiseUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Feature",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (promiseUtils, OAuthInfo, esriId, Map, MapView, FeatureLayer, Feature, BasemapGallery, Expand) {

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
    });

    //Constants for the HTML elements
    const personalPanelElement = document.getElementById("personalizedPanel");
    const anonPanelElement = document.getElementById("anonymousPanel");
    const sidePanelElement = document.getElementById("sidePanel");
    const headerPanelElement = document.getElementById("headerDiv");
    const eventsListElement = document.getElementById("eventList");

    //Initialize new FeatureLayer constant
    const traconLayer = new FeatureLayer({
      //AGOL portal item ID
      portalItem: {
        id: "383ab9e4787c4f8db81bd54988142db0"
      },
      //if no layerId provided, defaults to first layer in service
      //layerId: 0
      popupEnabled: true,
      outFields: ["*"],
      //configure popup design
      popupTemplate: {
        title: "TRACON: {tracon_id}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "stars_system",
                label: "STARS System"
              }
            ]
          }
        ]
      }
    });

    //Initialize new Map constant
    const map = new Map({
      basemap: "gray-vector",
      //add layers to map as a list
      layers: [traconLayer]
    });

    //Initialize new MapView constant
    const view = new MapView ({
      //html container
      container: "viewDiv",
      map: map,
      center: [-98.5795, 39.8283],
      zoom: 3,
      popup: {
        autoOpenEnabled: true
      }
    });

    //function to switch displays from the empty anonymous panel to the main app panel with content
    //called after successful OAuth
    function initializeApp() {
      //change html element display styles
      anonPanelElement.style.display = "none";
      personalPanelElement.style.display = "block";
      sidePanelElement.style.display = "block";

      //call the addWidgets function
      addWidgets();
    }

    //function to add map widgets to map view
    function addWidgets() {
        //Initialize Basemap Gallery widget
        const basemapGallery = new BasemapGallery({
            view: view
        });

        //Initialize Expand widget
        const expand = new Expand({
            view: view,
            //list of subwidgets to place inside the expand widget
            content: basemapGallery
        });

        //Add Basemap Gallery widget to map view
        view.ui.add([expand], {
            position: "top-right"
        });
    }

    //wait for view to load
    view.when(() => {
      const traconLayerView = view.whenLayerView(traconLayer);

      //build a query to pull features from feature layer
      const query = {
        //if no num or start properties are set, returns the maxRecordCount on feature service
        //start at the first feature
        //start: 0,
        //return first 20 records in query
        num: 1000,
        //return all fields from feature
        outFields: ["*"],
        returnGeometry: true,
        //order features by {field_name}
        orderByFields: ["stars_system"]
      };

      const promise = traconLayer.queryFeatures(query).then((featureSet) => convertFeatureSetToRows(featureSet, query));

      //function to loop through queried feature set and create pick list items for each feature
      function convertFeatureSetToRows(featureSet, query) {
        eventsListElement.innerHTML = "";
        eventsListElement.style.paddingTop = headerPanelElement.style.height.toString();

        let graphics = featureSet.features;
        graphics.forEach((result, index) => {
          const attributes = result.attributes;
          const name = attributes.tracon_id;

          const item = document.createElement("calcite-pick-list-item");
          item.setAttribute("label", name);
          item.setAttribute("value", index);
          item.setAttribute("description", "test");
          eventsListElement.appendChild(item);
        });
      };

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
              result && result.graphic.attributes[traconLayer.objectIdField];

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

        // Listen for the pointer-move event on the View and make sure that function is not invoked more than one at a time
        view.on("click", (event) => {
          debouncedUpdate(event).catch((err) => {
            if (!promiseUtils.isAbortError(err)) {
              throw err;
            }
          });
        });
      });
    });
});

//function to adjust css properties on side panel open button press
function openSide() {
  document.getElementById("sidePanel").style.width = "250px";
  document.getElementById("sidePanel").style.top = (document.getElementById("headerDiv").offsetHeight + 25).toString() + "px";
  document.getElementById("bodyDiv").style.marginLeft = "250px";
  document.getElementById("footerDiv").style.marginLeft = "250px";
  document.getElementById("openBtn").style.display = "none";
  document.getElementById("closeBtn").style.display = "block";
}

//function to adjust css properties on side panel close button press
function closeSide() {
  document.getElementById("sidePanel").style.width = "0px";
  document.getElementById("bodyDiv").style.marginLeft = "0px";
  document.getElementById("footerDiv").style.marginLeft = "10px";
  document.getElementById("closeBtn").style.display = "none";
  document.getElementById("openBtn").style.display = "block";
}