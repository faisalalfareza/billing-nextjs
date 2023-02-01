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

const { publicRuntimeConfig } = getConfig();

function Dashboards(props) {
  const { availableFPNoList } = props || {};

  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingRefresh, setLoadingRefresh] = useState(false);

  // useEffect(() => {
  //   getAvailableFPNo();
  // }, []);

  // const [availableFPNoList, setAvailableFPNo] = useState([]);
  // const getAvailableFPNo = async (e) => {
  //   if (e) e.preventDefault();
  //   setLoadingRefresh(true);

  //   const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Dashboard/GetAvailableFPNo`;
  //   const config = {headers: {Authorization: "Bearer " + accessToken}};
  //   axios
  //     .get(url, config)
  //     .then(res => {
  //       let availableFPNoList = res.data.result;
  //       availableFPNoList = availableFPNoList.sort((a, b) => a.totalFPNo - b.totalFPNo);
  //       setAvailableFPNo(availableFPNoList);

  //       setLoadingRefresh(false);
  //     }).catch((error) => setLoadingRefresh(false));
  // };

  const showTopAvailableFPNoOnWidget = () => {
    if (availableFPNoList && availableFPNoList.length) {
      const count = availableFPNoList.length;
      const column = count > 3 ? 3 : 4;

      let contents = [];
      availableFPNoList.forEach((el, i) => {
        contents.push(
          <Grid key={i} item xs={12} sm={column}>
            <DefaultStatisticsCard
              coName={el.coName}
              coCode={el.coCode}
              count={el.totalFPNo}
              percentage={{
                color: "success",
                value: "+55%",
                label: "since last month",
              }}
            />
          </Grid>
        );
      });
      return contents;
    }
    return null;
  };

  const showTopAvailableFPNoOnTasklist = () => {
    return {
      columns: [
        { Header: "Company Code", accessor: "coCode" },
        { Header: "Company Name", accessor: "coName" },
        { Header: "Total Batch Stock", accessor: "totalFPNo", align: "right" },
      ],
      rows: availableFPNoList,
    };
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">
                    Total Available No. Seri Faktur Pajak
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Tax invoice serial number is the serial number given by the
                    Directorate General of Taxes (DGT) to Taxable Entrepreneurs
                    with a certain mechanism.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => getAvailableFPNo(e)}
                >
                  {/* <Icon>refresh</Icon>&nbsp; {isLoadingRefresh ? "Refreshing.." : "Refresh"} */}
                  <Icon>refresh</Icon>&nbsp; Refresh
                </MDButton>
              </Grid>
            </Grid>
          </Grid>

          {showTopAvailableFPNoOnWidget()}

          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h5" fontWeight="medium">
                  List of Company չ Total Branch Stock
                </MDTypography>
              </MDBox>
              <MDBox py={1}>
                <DataTable
                  table={showTopAvailableFPNoOnTasklist()}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  isSorted={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default Dashboards;

export async function getAvailableFPNo() {
  const response = await fetch(
    `${publicRuntimeConfig.apiUrl}/api/services/app/Dashboard/GetAvailableFPNo`
  );
  let data = await response.json();
  data = data.result.sort((a, b) => a.totalFPNo - b.totalFPNo);

  return data;
}

export async function getStaticProps() {
  let availableFPNoList = await getAvailableFPNo();
  if (availableFPNoList.length == 0) {
    availableFPNoList = [
      {
        companyID: 1,
        coName: "PT SANDIEGO HILLS MEMORIAL PARK",
        coCode: "16500",
        totalFPNo: 2354,
      },
      {
        companyID: 2,
        coName: "PT GUNUNG HALIMUN ELOK",
        coCode: "A0067",
        totalFPNo: 3456,
      },
      {
        companyID: 3,
        coName: "KSO ORANGE COUNTY TOWER G",
        coCode: "KOC",
        totalFPNo: 8565,
      },
      {
        companyID: 4,
        coName: "PT. MAHKOTA SENTOSA UTAMA",
        coCode: "MSU",
        totalFPNo: 1232,
      },
    ];
  }

  return {
    props: {
      availableFPNoList: availableFPNoList,
    },
    revalidate: 5,
  };
}
