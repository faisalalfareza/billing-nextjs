import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import getConfig from "next/config";

import MDBox from "/components/MDBox";
import MDButton from "/components/MDButton";
import MDTypography from "/components/MDTypography";

import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import DataTable from "/layout/Tables/DataTable";
import DefaultStatisticsCard from "./components/DefaultStatisticsCard";
import Footer from "/layout/Footer";
import dashboardImage from "/assets/images/coming-soon.svg";
import Image from "next/image";

const { publicRuntimeConfig } = getConfig();

function Dashboards(props) {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} display="flex" justifyContent="center" height="80vh">
        {dashboardImage.src ? (
          <Image
            src={dashboardImage.src}
            alt="coming soon"
            width={500}
            height={500}
            quality={100}
          />
        ) : (
          dashboardImage
        )}
      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default Dashboards;
