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
    const headerPanelElement = document.getElementById("headerDiv");
    const sidePanelElement = document.getElementById("sidePanel");
    const eventsListElement = document.getElementById("eventList");

    //function to switch displays from the empty anonymous panel to the main app panel with content
    //called after successful OAuth
    function initializeApp() {
        //change html element display styles
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "block";
        sidePanelElement.style.display = "block";

  
        //call the addWidgets function
        //addWidgets();
    }

    //Initialize new FeatureLayer constant
    const listLayer = new FeatureLayer({
        //AGOL portal item ID
        portalItem: {
          id: "e0e2d6c68a2243b797ab2fd177567d4c"
        },
        //if no layerId provided, defaults to first layer in service
        //layerId: 0
        popupEnabled: true,
        outFields: ["*"],
        //configure popup design
        popupTemplate: {
          title: "SITREP: {incident}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "incident_name",
                  label: "Incident Name"
                }
              ]
            }
          ]
        }
    });

    //build a query to pull features from feature layer
    const query = {
        //if no num or start properties are set, returns the maxRecordCount on feature service
        //start at the first feature
        //start: 0,
        //return first 20 records in query
        num: 1000,
        //return all fields from feature
        outFields: ["*"],
        //for apps without a map, geometry is unnecessary
        returnGeometry: true,
        //order features by {field_name}
        orderByFields: ["objectid"]
      };

      const promise = listLayer.queryFeatures(query).then((featureSet) => convertFeatureSetToRows(featureSet, query));
      
      let features;
      //function to loop through queried feature set and create pick list items for each feature
      function convertFeatureSetToRows(featureSet, query) {
        eventsListElement.innerHTML = "";
        eventsListElement.style.paddingTop = headerPanelElement.style.height.toString();

        features = featureSet.features;
        features.forEach((result, index) => {
          const attributes = result.attributes;
          const label = attributes.incident_name;

          const item = document.createElement("calcite-pick-list-item");
          item.setAttribute("label", label);
          item.setAttribute("value", index);
          item.setAttribute("description", attributes.incident_start_dtg);
          item.addEventListener("click", listClickHandler);
          eventsListElement.appendChild(item);
        });
      };

      function listClickHandler(event) {
        console.log(event.target);
      }
});

//function to adjust css properties on side panel open button press
function openSide() {

    const newIncidentForm = new Survey123WebForm({
        clientId: "KiHuSotTULGiKtfZ",
        container: "surveyView",
        itemId: "2d22a805f44c4f5d8eaa3bc0d7712ca1",
        portalUrl: "https://cobecconsulting.maps.arcgis.com"
    });

    document.getElementById("sidePanel").style.width = "250px";
    document.getElementById("sidePanel").style.top = (document.getElementById("headerDiv").offsetHeight + 25).toString() + "px";
    document.getElementById("bodyDiv").style.marginLeft = "250px";
    document.getElementById("openBtn").style.display = "none";
    document.getElementById("closeBtn").style.display = "block";
}
  
  //function to adjust css properties on side panel close button press
  function closeSide() {
    document.querySelectorAll('iframe').forEach(
        function(elem){
            elem.parentNode.removeChild(elem);
    });

    document.getElementById("sidePanel").style.width = "0px";
    document.getElementById("bodyDiv").style.marginLeft = "0px";
    document.getElementById("closeBtn").style.display = "none";
    document.getElementById("openBtn").style.display = "block";
}