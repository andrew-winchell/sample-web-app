require([
    "esri/portal/Portal",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/portal/PortalQueryParams",
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (Portal, OAuthInfo, esriId, PortalQueryParams, esriConfig, Map, MapView, BasemapGallery, Expand) {
    const personalPanelElement = document.getElementById("personalizedPanel");
    const anonPanelElement = document.getElementById("anonymousPanel");
    const userIdElement = document.getElementById("userId");


    const INFO = new OAuthInfo({
        appId: "KiHuSotTULGiKtfZ",
        portalUrl: "https://cobecconsulting.maps.arcgis.com",
        authNamespace: "portal_oauth_inline",
        flowtype: "auto",
        popup: false,
        //popupCallbackUrl: "oauth-callback.html"
    });

    esriId.registerOAuthInfos([INFO]);

    esriId.checkSignInStatus(INFO.portalUrl + "/sharing").then(() => {
        displayItems();
    }).catch(() => {
        anonPanelElement.style.display = "block";
        personalPanelElement.style.display = "none";
    });

    document.getElementById("sign-in").addEventListener("click", () => {
        esriId.getCredential(INFO.portalUrl + "/sharing");
    });

    document.getElementById("sign-out").addEventListener("click", () => {
        esriId.destroyCredentials();
        window.location.reload();
    });

    //Developer Dashboard ArcGIS API Key
    //esriConfig.apiKey = "AAPK0d997cff573e4a00a21f46b5ce9dd0fcDEvU_DalfJdwLqQjyVLb-gt9N5lFcLwfbzVwV9egBdIDWBtpYrgh_I8idfMduczS";

    //Initialize the map
    /*const MAP = new Map({
        basemap: "arcgis-dark-gray"
    });

    //Set the map view
    const VIEW = new MapView({
        container: "viewDiv",
        map: MAP,
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
    });*/

});