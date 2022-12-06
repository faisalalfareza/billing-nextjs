import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DefaultStatisticsCard from "./components/DefaultStatisticsCard";
import DataTable from "/layout/Tables/DataTable";

// Data
import axios from "axios";
import getConfig from 'next/config';
import { useCookies } from 'react-cookie';
const { publicRuntimeConfig } = getConfig();


function Dashboards() {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingRefresh, setLoadingRefresh] = useState(false);

  useEffect(() => {
    getAvailableFPNo();
  }, []);

  const [availableFPNoList, setAvailableFPNo] = useState([]);
  const getAvailableFPNo = async (e) => {
    if (e) e.preventDefault();
    setLoadingRefresh(true);

    const url = `${publicRuntimeConfig.apiUrl}/services/app/Dashboard/GetAvailableFPNo`;
    const config = {headers: {Authorization: "Bearer " + accessToken}};
    axios
      .get(url, config)
      .then(res => {
        let availableFPNoList = res.data.result;
        availableFPNoList = availableFPNoList.sort((a, b) => a.totalFPNo - b.totalFPNo);
        setAvailableFPNo(availableFPNoList);

        setLoadingRefresh(false);
      });
  };
  
  const showTopAvailableFPNoOnWidget = () => {
    if (availableFPNoList && availableFPNoList.length) {
      const count = availableFPNoList.length;
      const column = (count > 3 ? 3 : 4);

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
              // dropdown={{
              //   action: openSalesDropdown,
              //   menu: renderMenu(salesDropdown, closeSalesDropdown),
              //   value: salesDropdownValue,
              // }}
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
      rows: availableFPNoList
    }
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
                    Tax invoice serial number is the serial number given by the Directorate General of Taxes (DGT) to Taxable Entrepreneurs with a certain mechanism.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <MDButton variant="outlined" color="secondary" onClick={(e) => getAvailableFPNo(e)}>
                  <Icon>refresh</Icon>&nbsp; {isLoadingRefresh ? "Refreshing.." : "Refresh"}
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