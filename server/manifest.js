import connectRoute from "connect-route";

const basePath = Meteor.absoluteUrl("/");

const manifest = {
  name: "L'atelier",
  short_name: "L'atelier",
  start_url: `${basePath}`,
  display: "standalone",
  background_color: "#fdfdfd",
  theme_color: "#455A64",
  orientation: "landscape-primary",
  icons: [
    {
      src: `${basePath}favicon/android-icon-36x36.png`,
      sizes: "36x36",
      type: "image/png",
      density: "0.75"
    },
    {
      src: `${basePath}favicon/android-icon-48x48.png`,
      sizes: "48x48",
      type: "image/png",
      density: "1.0"
    },
    {
      src: `${basePath}favicon/android-icon-72x72.png`,
      sizes: "72x72",
      type: "image/png",
      density: "1.5"
    },
    {
      src: `${basePath}favicon/android-icon-96x96.png`,
      sizes: "96x96",
      type: "image/png",
      density: "2.0"
    },
    {
      src: `${basePath}favicon/android-icon-144x144.png`,
      sizes: "144x144",
      type: "image/png",
      density: "3.0"
    },
    {
      src: `${basePath}favicon/android-icon-192x192.png`,
      sizes: "192x192",
      type: "image/png",
      density: "4.0"
    }
  ]
};

WebApp.connectHandlers.use(
  connectRoute(function (router) {
    router.get("/favicon/manifest.json", function (req, res) {
      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      return res.end(JSON.stringify(manifest));
    });
  })
);
