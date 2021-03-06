require([
    "esri/core/promiseUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/layers/FeatureLayer",
    "esri/widgets/Feature"
], function (promiseUtils, OAuthInfo, esriId, FeatureLayer, Feature) {

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
        openNewIncident();
    }

    // Create a default graphic for when the application starts
    const graphic = {
        popupTemplate: {
          content: "Select from incident list to view details..."
        }
    };

    // Provide graphic to a new instance of a Feature widget
    const feature = new Feature({
        container: "featureDetailsDiv",
        graphic: graphic
    });

    //Initialize new FeatureLayer constant
    const listLayer = new FeatureLayer({
        //AGOL portal item ID
        portalItem: {
          id: "e0e2d6c68a2243b797ab2fd177567d4c"
        },
        refreshInterval: 0.1,
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
        //return first 1000 records in query
        num: 1000,
        //return all fields from feature
        outFields: ["*"],
        //for apps without a map, geometry is unnecessary
        returnGeometry: true,
        //order features by {field_name}
        orderByFields: ["objectid"]
    };

    listLayer.on("refresh", function(event){
        console.log("REFRESH");
        if (event.dataChanged) {
            document.querySelectorAll("calcite-value-list-item").forEach(
                function(elem){
                    elem.parentNode.removeChild(elem);
            });
            listLayer.queryFeatures(query).then((newFeatureSet) => convertFeatureSetToRows(newFeatureSet, query))
        }
    });

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

            const item = document.createElement("calcite-value-list-item");
            item.setAttribute("label", label);
            item.setAttribute("value", index);
            item.setAttribute("description", attributes.incident_start_dtg);
            item.addEventListener("click", () => listClickHandler(attributes));
            eventsListElement.appendChild(item);
        });
    };

    function listClickHandler(attributes) {
        if (itemGlobalId != attributes.globalid){
            itemGlobalId = attributes.globalid; 
            if (surveyItemId != "9d335e842d3f471f97cdba72bd53a430"){
                resetSurvey(itemGlobalId);
            }
        }
    };
});

let itemGlobalId;
let surveyItemId;
let survey123Instance;

function openNewIncident() {
    if (surveyItemId != "9d335e842d3f471f97cdba72bd53a430") {

        surveyItemId = "9d335e842d3f471f97cdba72bd53a430";

        document.querySelectorAll('iframe').forEach(
            function(elem){
                elem.parentNode.removeChild(elem);
        });

        survey123Instance = new Survey123WebForm({
            clientId: "KiHuSotTULGiKtfZ",
            container: "surveyView",
            itemId: surveyItemId,
            portalUrl: "https://cobecconsulting.maps.arcgis.com"
        });
    }
}

function openIncidentDetails() {
    // remove prior loaded survey from surveyPane
    document.querySelectorAll('iframe').forEach(
        function(elem){
            elem.parentNode.removeChild(elem);
    });

    // check to see if a list item has been selected
    if(itemGlobalId != undefined){
        //set the survey item id
        surveyItemId = "3e58460a08b84cd7a90f32b2f21ba728";

        // create a new survey123 instance with the new global id and form item id
        survey123Instance = new Survey123WebForm({
            clientId: "KiHuSotTULGiKtfZ",
            container: "surveyView",
            itemId: surveyItemId,
            portalUrl: "https://cobecconsulting.maps.arcgis.com",
            globalId: itemGlobalId,
            mode: "edit"
        });
    }
    //if no list item selected, re-run every .25 seconds until true
    else{
        setTimeout(openIncidentDetails, 250);
    }
}

function openKeyTakeaways() {
    // remove prior loaded survey from surveyPane
    document.querySelectorAll('iframe').forEach(
        function(elem){
            elem.parentNode.removeChild(elem);
    });

    // check to see if a list item has been selected
    if(itemGlobalId != undefined){
        //set the survey item id
        surveyItemId = "98a44f915cc141439ff807eca0c7b671";

        // create a new survey123 instance with the new global id and form item id
        survey123Instance = new Survey123WebForm({
            clientId: "KiHuSotTULGiKtfZ",
            container: "surveyView",
            itemId: surveyItemId,
            portalUrl: "https://cobecconsulting.maps.arcgis.com",
            globalId: itemGlobalId,
            mode: "edit"
        });
    }
    //if no list item selected, re-run every .25 seconds until true
    else{
        setTimeout(openKeyTakeaways, 250);
    }
}

function resetSurvey(itemGlobalId) {
    if (survey123Instance) {
        surveyItemId = survey123Instance.options.itemId;

        document.querySelectorAll('iframe').forEach(
            function(elem){
                elem.parentNode.removeChild(elem);
        });
        
        let newSurvey123Instance = new Survey123WebForm({
            clientId: "KiHuSotTULGiKtfZ",
            container: "surveyView",
            itemId: surveyItemId,
            portalUrl: "https://cobecconsulting.maps.arcgis.com",
            globalId: itemGlobalId,
            mode: "edit"
        });
    }
}

//function to adjust css properties on side panel open button press
function openSide() {
    document.getElementById("sidePanel").style.width = "250px";
    document.getElementById("sidePanel").style.top = (document.getElementById("headerDiv").offsetHeight + 25).toString() + "px";
    document.getElementById("bodyDiv").style.marginLeft = "250px";
    document.getElementById("openBtn").style.display = "none";
    document.getElementById("closeBtn").style.display = "block";
}
  
  //function to adjust css properties on side panel close button press
function closeSide() {
    document.getElementById("sidePanel").style.width = "0px";
    document.getElementById("bodyDiv").style.marginLeft = "0px";
    document.getElementById("closeBtn").style.display = "none";
    document.getElementById("openBtn").style.display = "block";
}