import Head from "next/head";
import "../styles/globals.css";
import "../styles/nextjs-argon-dashboard.css";
import { AppProps } from "next/app";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
// @emotion
import createCache from "@emotion/cache";
// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
// NextJS Material Dashboard 2 PRO components
import MDBox from "../components/MDBox";
// @emotion/react components
import { CacheProvider } from "@emotion/react";
import { CookiesProvider } from "react-cookie";
// @fullcalendar styles
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";

// NextJS Material Dashboard 2 PRO themes
import theme from "/assets/theme";
import themeRTL from "/assets/theme/theme-rtl";

// NextJS Material Dashboard 2 PRO Dark Mode themes
import themeDark from "/assets/theme-dark";
import themeDarkRTL from "/assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";

// NextJS Material Dashboard 2 PRO routes
import setRoutes from "../routes";

// NextJS Material Dashboard 2 PRO Context Provider
import {
  MaterialUIControllerProvider,
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "../context";

// NextJS Material Dashboard 2 PRO examples
import Sidenav from "/layout/Sidenav";
import Configurator from "/layout/Configurator";
import appInfo from "/appinfo.json";

// Images
import favicon from "../assets/images/favicon.ico";
import appleIcon from "../assets/images/apple-icon.png";
// import brandWhite from "../assets/images/logo-ct.png";
// import brandDark from "../assets/images/logo-ct-dark.png";
import brandWhite from "../assets/images/app-logo-on-dark.png";
import brandDark from "../assets/images/app-logo-on-light.png";

import { Loading  } from "notiflix/build/notiflix-loading-aio";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createCache({ key: "css", prepend: true });

function Main({ Component, pageProps, routes = setRoutes() }) {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useRouter();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true) }, []);

  const brandIcon =
    (transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite;

  // const configsButton = (
  //   <MDBox
  //     display="flex"
  //     justifyContent="center"
  //     alignItems="center"
  //     width="3.25rem"
  //     height="3.25rem"
  //     bgColor="white"
  //     shadow="sm"
  //     borderRadius="50%"
  //     position="fixed"
  //     right="2rem"
  //     bottom="2rem"
  //     zIndex={99}
  //     color="dark"
  //     sx={{ cursor: "pointer" }}
  //     onClick={handleConfiguratorOpen}
  //   >
  //     <Icon fontSize="small" color="inherit">
  //       settings
  //     </Icon>
  //   </MDBox>
  // );

  // return direction === "rtl" ? (
  //   <CacheProvider value={rtlCache}>
  //     <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
  //       <CssBaseline />
  //       <Component {...pageProps} />
  //       {layout === "dashboard" && (
  //         <>
  //           <Sidenav
  //             color={sidenavColor}
  //             brand={brandIcon}
  //             brandName={appInfo.appName}
  //             routes={routes.main}
  //             onMouseEnter={handleOnMouseEnter}
  //             onMouseLeave={handleOnMouseLeave}
  //           />
  //           <Configurator />
  //           {/* {configsButton} */}
  //         </>
  //       )}
  //       {layout === "vr" && <Configurator />}
  //     </ThemeProvider>
  //   </CacheProvider>
  // ) : 
  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <Component {...pageProps} />
      {layout === "dashboard" && hydrated && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={brandIcon}
            brandName={appInfo.appName}
            routes={routes.filteredMain}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          {/* <Configurator /> */}
          {/* {configsButton} */}
        </>
      )}
      {/* {layout === "vr" && <Configurator />} */}
    </ThemeProvider>
  );
}

function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}) {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => Loading.hourglass({
      svgColor: "rgba(27, 156, 252,1.0)",
      backgroundColor: "rgba(0, 0, 0, 0.6)"
    });
    const handleComplete = () => Loading.remove();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <MaterialUIControllerProvider>
        <CacheProvider value={emotionCache}>
          <CookiesProvider>
            <Head>
              <meta charSet="utf-8" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta
                name="viewport"
                content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
              />
              <meta name="description" content="Description" />
              <meta name="keywords" content="Keywords" />
              <title>{appInfo.appName}</title>

              <link rel="manifest" href="/manifest.json" />
              <link
                href={"/icons/favicon-16x16.png"}
                rel="icon"
                type="image/png"
                sizes="16x16"
              />
              <link
                href="/icons/favicon-32x32.png"
                rel="icon"
                type="image/png"
                sizes="32x32"
              />
              <link rel="apple-touch-icon" href="/apple-icon.png"></link>
              <meta name="theme-color" content="#317EFB" />
            </Head>

            <Main Component={Component} pageProps={pageProps} />
          </CookiesProvider>
        </CacheProvider>
      </MaterialUIControllerProvider>
    </>
  );
}

export default MyApp;
