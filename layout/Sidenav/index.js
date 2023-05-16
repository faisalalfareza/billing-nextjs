import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import PropTypes from "prop-types";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MuiLink from "@mui/material/Link";
import Icon from "@mui/material/Icon";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
  setSelectedColorSidenav,
} from "/context";

import SidenavCollapse from "/layout/Sidenav/SidenavCollapse";
import SidenavList from "/layout/Sidenav/SidenavList";
import SidenavItem from "/layout/Sidenav/SidenavItem";
import SidenavRoot from "/layout/Sidenav/SidenavRoot";
import sidenavLogoLabel from "/layout/Sidenav/styles/sidenav";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true) }, []);

  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentSidenav,
    whiteSidenav,
    coloredSidenav,
    darkMode,
  } = controller;
  const { pathname } = useRouter();
  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items[1];
  const itemName = items[items.length - 1];

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    setOpenCollapse(collapseName);
    setOpenNestedCollapse(itemParentName);
  }, [collapseName, itemParentName]);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : transparentSidenav
      );
      setWhiteSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : whiteSidenav
      );
      setSelectedColorSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : coloredSidenav
      );
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, transparentSidenav, whiteSidenav, coloredSidenav]);

  // Render all the nested collapse items from the routes.js
  const renderNestedCollapse = (collapse) => {
    const template = collapse.map(({ name, route, key, href }) =>
      href ? (
        <MuiLink
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavItem name={name} nested />
        </MuiLink>
      ) : (
        <Link href={route} key={key} sx={{ textDecoration: "none" }}>
          <a>
            <SidenavItem name={name} active={route === pathname} nested />
          </a>
        </Link>
      )
    );

    return template;
  };
  // Render the all the collpases from the routes.js
  const renderCollapse = (collapses) => {
    return collapses.map(({ icon, name, collapse, route, href, key, onClick }) => {
      let returnValue;

      if (collapse) {
        returnValue = (
          <SidenavItem
            key={key}
            color={color}
            name={name}
            active={key === itemParentName ? "isParent" : false}
            open={openNestedCollapse === key}
            onClick={({ currentTarget }) =>
              openNestedCollapse === key &&
              currentTarget.classList.contains("MuiListItem-root")
                ? setOpenNestedCollapse(false)
                : setOpenNestedCollapse(key)
            }
          >
            {renderNestedCollapse(collapse)}
          </SidenavItem>
        );
      } else {
        if (href) {
          returnValue = (
            <MuiLink
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavItem
                color={color}
                name={name}
                active={key === itemName}
              />
            </MuiLink>
          );
        } else if (
          onClick ||
          [name.toLowerCase(), key.toLowerCase()].indexOf("logout") != -1
        ) {
          returnValue = (
            <Link href={route} key={key} sx={{ textDecoration: "none" }}>
              <a
                onClick={() => {
                  const cached = [
                    {
                      key: "application",
                      value: localStorage.getItem("application"),
                    },
                    // {
                    //   key: "profilePicture",
                    //   value: localStorage.getItem("profilePicture"),
                    // },
                  ];
                  localStorage.clear();
                  cached.forEach((c) => localStorage.setItem(c.key, c.value));
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                      .replace(/^ +/, "")
                      .replace(
                        /=.*/,
                        "=;expires=" + new Date().toUTCString() + ";path=/"
                      );
                  });
                }}
              >
                <SidenavItem
                  icon={icon}
                  color={color}
                  name={name}
                  active={key === itemName}
                />
              </a>
            </Link>
          );
        } else {
          returnValue = (
            <Link href={route} key={key} sx={{ textDecoration: "none" }}>
              <a>
                <SidenavItem
                  icon={icon}
                  color={color}
                  name={name}
                  active={key === itemName}
                />
              </a>
            </Link>
          );
        }

        // returnValue = href ? (
        //   <MuiLink
        //     href={href}
        //     key={key}
        //     target="_blank"
        //     rel="noreferrer"
        //     sx={{ textDecoration: "none" }}
        //   >
        //     <SidenavItem color={color} name={name} active={key === itemName} />
        //   </MuiLink>
        // ) : (
        //   <Link href={route} key={key} sx={{ textDecoration: "none" }}>
        //     <a>
        //       <SidenavItem
        //         color={color}
        //         name={name}
        //         active={key === itemName}
        //       />
        //     </a>
        //   </Link>
        // );
      }
      return <SidenavList key={key}>{returnValue}</SidenavList>;
    });
  };

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  // const renderRoutes = routes.map(
  //   ({ type, name, icon, title, collapse, noCollapse, key, href, route, onClick }) => {
  const renderRoutes = routes.map((e) => {
    const {
      type,
      name,
      icon,
      title,
      collapse,
      noCollapse,
      key,
      href,
      route,
      onClick,
    } = e;
    let returnValue;

    if ((key === "username") && !hydrated)
      return returnValue;

    if (type === "collapse") {
      if (href) {
        returnValue = (
          <MuiLink
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </MuiLink>
        );
      } else if (noCollapse && route) {
        returnValue = (
          <Link href={route} key={key} passHref>
            <a>
              <SidenavCollapse
                name={name}
                icon={icon}
                noCollapse={noCollapse}
                active={key === collapseName}
              >
                {collapse ? renderCollapse(collapse) : null}
              </SidenavCollapse>
            </a>
          </Link>
        );
      } else {
        returnValue = (
          <SidenavCollapse
            key={key}
            name={name}
            icon={icon}
            active={key === collapseName}
            open={openCollapse === key}
            onClick={() =>
              openCollapse === key
                ? setOpenCollapse(false)
                : setOpenCollapse(key)
            }
          >
            {collapse ? renderCollapse(collapse) : null}
          </SidenavCollapse>
        );
      }
    } else if (type === "title") {
      if (miniSidenav) {
        returnValue = false;
      } else {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            whiteSpace="pre-wrap"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      }
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
      );
    }

    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{
        transparentSidenav,
        whiteSidenav,
        coloredSidenav,
        miniSidenav,
        darkMode,
      }}
    >
      <MDBox pt={3} pb={1} px={3} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <Link href="/dashboards">
          <a>
            <MDBox display="flex" alignItems="center">
              {brand && brand.src ? (
                <MDBox
                  component="img"
                  src={brand.src}
                  alt={brandName}
                  width={miniSidenav ? "1.75rem" : "4rem"}
                />
              ) : (
                brand
              )}
              <MDBox
                width={!brandName && "100%"}
                sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
              >
                <MDTypography
                  component="h6"
                  variant="button"
                  fontWeight="medium"
                  color={textColor}
                  letterSpacing="1px"
                  textTransform="uppercase"
                  ml={1}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {brandName}
                </MDTypography>
              </MDBox>
            </MDBox>
          </a>
        </Link>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "white",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
