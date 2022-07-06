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

});

//function to adjust css properties on side panel open button press
function openSide() {

    newIncidentForm = new Survey123WebForm({
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
    delete newIncidentForm;

    document.getElementById("sidePanel").style.width = "0px";
    document.getElementById("bodyDiv").style.marginLeft = "0px";
    document.getElementById("closeBtn").style.display = "none";
    document.getElementById("openBtn").style.display = "block";
}