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
    }).catch(() => {
        //If not signed in, display "sign-in" panel
        anonPanelElement.style.display = "block";
        personalPanelElement.style.display = "none";
    });
    
    //Listen for click on the "Sign-In" div in html
    document.getElementById("sign-in").addEventListener("click", () => {
        esriId.getCredential(INFO.portalUrl + "/sharing");
    });
    
    //Listen for click on the "Sign-Out" div in html

    function displayMap() {
        //Initialize the map
        const MAP = new Map({
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
        });
        
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "block";
    }

      /*const portal = new Portal();
      // Setting authMode to immediate signs the user in once loaded
      portal.authMode = "immediate";
      // Once loaded, user is signed in
      portal.load().then(() => {
        // Create query parameters for the portal search
        const queryParams = new PortalQueryParams({
          query: "owner:" + portal.user.username,
          sortField: "numViews",
          sortOrder: "desc",
          num: 20
        });
    
        userIdElement.innerHTML = portal.user.username;
        anonPanelElement.style.display = "none";
        personalPanelElement.style.display = "block";
    
        // Query the items based on the queryParams created from portal above
        portal.queryItems(queryParams).then(createGallery);
      });
    }

    function createGallery(items) {
      let htmlFragment = "";

      items.results.forEach((item) => {
        htmlFragment +=
          '<div class="esri-item-container">' +
          (item.thumbnailUrl
            ? '<div class="esri-image" style="background-image:url(' + item.thumbnailUrl + ');"></div>'
            : '<div class="esri-image esri-null-image">Thumbnail not available</div>') +
          (item.title
            ? '<div class="esri-title">' + (item.title || "") + "</div>"
            : '<div class="esri-title esri-null-title">Title not available</div>') +
          "</div>";
      });
      document.getElementById("itemGallery").innerHTML = htmlFragment;
    }*/
});