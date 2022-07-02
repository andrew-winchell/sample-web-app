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

    //Constants for the HTML elements
    const personalPanelElement = document.getElementById("personalizedPanel");
    const anonPanelElement = document.getElementById("anonymousPanel");

    //function to switch displays from the empty anonymous panel to the main app panel with content
    //called after successful OAuth
    function initializeApp() {
        //change html element display styles
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "block";
        //sidePanelElement.style.display = "block";

        var newIncidentForm = new Survey123WebForm({
            clientId: "KiHuSotTULGiKtfZ",
            container: "viewDiv",
            itemId: "2d22a805f44c4f5d8eaa3bc0d7712ca1",
            portalUrl: "https://cobecconsulting.maps.arcgis.com"
        });
  
        //call the addWidgets function
        //addWidgets();
    }
    });
});