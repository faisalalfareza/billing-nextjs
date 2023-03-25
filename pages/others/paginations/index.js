import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import MDBox from "/components/MDBox";
import MDButton from "/components/MDButton";
import MDTypography from "/components/MDTypography";
import MDBadge from "/components/MDBadge";

// import Clarifiers from "/layout/Customs/Clarifiers";
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import DataTable from "/layout/Tables/DataTable";

function Paginations() {
  const [isLoadingRefresh, setLoadingRefresh] = useState(false);

  const [customerList, setCustomerList] = useState([]);
  const getCustomerListClientSide = async (e) => {
    if (e) e.preventDefault();
    setLoadingRefresh(true);

    const url = `http://18.140.60.145:1010/api/services/app/CashierSystem/GetCustomerList`;
    const config = {
      // headers: { Authorization: "Bearer " + accessToken }
      params: {
        MaxResultCount: 10, // Rows Per Page (Fixed). Start From 1
        SkipCount: 0, // Increments Based On Page (Flexible). Start From 0
      },
    };

    axios
      .get(url, config)
      .finally(() => setLoadingRefresh(false))
      .then((res) => {
        let data = res.data.result.items;
        setCustomerList(data);
      })
      .catch(() => setLoadingRefresh(false));
  };
  useEffect(() => getCustomerListClientSide(), []);

  const [pageData, setPageData] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [skipCount, setSkipCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2); // Default to 10
  const [keywords, setKeywords] = useState("");
  const recordsPerPageChangeHandler = (e) => {
    recordsPerPage = e;
    setRecordsPerPage(recordsPerPage);
  };
  const keywordsChangeHandler = (e) => {
    keywords = e;
    setKeywords(keywords);
  };
  const getCustomerListServerSide = async (e) => {
    if (e) e.preventDefault();
    setLoadingRefresh(true);

    const url = `http://18.140.60.145:1010/api/services/app/CashierSystem/GetCustomerList`;
    const config = {
      // headers: { Authorization: "Bearer " + accessToken }
      params: {
        MaxResultCount: recordsPerPage, // Rows Per Page (Fixed). Start From 1
        SkipCount: skipCount, // Increments Based On Page (Flexible). Start From 0
        Search: keywords,
      },
    };

    axios
      .get(url, config)
      .finally(() => setLoadingRefresh(false))
      .then((res) => {
        let data = res.data.result;
        setPageData((prevState) => ({
          ...prevState,
          rowData: data.items,
          totalRows: data.totalCount,
          totalPages: Math.ceil(data.totalCount / recordsPerPage),
        }));
      })
      .catch(() => setLoadingRefresh(false));
  };
  useEffect(
    () => getCustomerListServerSide(),
    [skipCount, recordsPerPage, keywords]
  );

  const setCustomerTaskList = (rows) => {
    return {
      columns: [
        { Header: "Unit Data ID", accessor: "unitDataId" },
        { Header: "Project Name", accessor: "projectName" },
        { Header: "Cluster Name", accessor: "clusterName" },
        { Header: "Unit Code", accessor: "unitCode" },
        { Header: "Unit No", accessor: "unitNo" },
        { Header: "Unit Name", accessor: "unitName" },
        { Header: "PS Code", accessor: "psCode" },
        { Header: "Customer Name", accessor: "customerName" },
      ],
      rows: rows,
    };
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* <Clarifiers
          title="Default Client-side Pagination Component Using react-table"
          desc={
            "Pertama, Anda perlu memahami perbedaan mendasar antara paginasi sisi klien dan paginasi sisi server. Di halaman sisi klien, kami sudah memiliki semua data untuk semua halaman yang perlu kami tampilkan di tabel yang berarti kami juga mengetahui jumlah totalnya (totalcount=pagesize*number of pages). Sekarang bandingkan ini dengan paginasi sisi server."
          }
      /> */}
      <MDBox pb={3}>
        <Card>
          <MDBox p={3} pb={0} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">
                    List of Customer &nbsp;
                    <MDBadge
                      variant="gradient"
                      color="info"
                      badgeContent="Client-side Pagination"
                      size="lg"
                      container
                    />
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Used to display a list with a relatively small amount of
                    data, so that the mechanism will get the data as a whole
                    immediately at the start of loading.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => getCustomerListClientSide(e)}
                >
                  <Icon>refresh</Icon>&nbsp;{" "}
                  {isLoadingRefresh ? "Refreshing.." : "Refresh"}
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable
            table={setCustomerTaskList(customerList)}
            canEntriesPerPage
            entriesPerPage={{ defaultValue: 2 }}
          />
        </Card>
      </MDBox>

      {/* <Clarifiers
          title="Custom Server-side Pagination Component Using react-table"
          desc={
            "Kami akan mendapatkan potongan data yang kami minta artinya jika kami mempertahankan ukuran halaman sebagai 10 dan kami memiliki 100 data di server kami, tetapi karena kami meminta 10 jadi kami hanya akan mendapatkan 10 item. Lalu bagaimana komponen pagination mengetahui berapa jumlah total halaman yang perlu ditampilkan? Itu sebabnya kami membutuhkan jumlah total dari server juga saat kami mengambil data. Tapi tunggu, apakah kita membutuhkannya setiap saat? Yah, itu tergantung pada kasus penggunaan Anda. Secara umum, kami membutuhkan jumlah total baik untuk pertama kali atau jika kami melakukan pencarian atau filter."
          }
      /> */}
      <MDBox>
        <Card>
          <MDBox p={3} pb={0} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">
                    List of Customer &nbsp;
                    <MDBadge
                      variant="gradient"
                      color="info"
                      badgeContent="Server-side Pagination"
                      size="lg"
                      container
                    />
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Used to display a list with a relatively large amount of
                    data, so that the mechanism will get the data divided. This
                    division is based on the parameters "Max Result Count" and
                    "Skip Count".
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => getCustomerListServerSide(e)}
                >
                  <Icon>refresh</Icon>&nbsp;{" "}
                  {isLoadingRefresh ? "Refreshing.." : "Refresh"}
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable
            table={setCustomerTaskList(pageData.rowData)}
            canEntriesPerPage
            entriesPerPage={{ defaultValue: recordsPerPage }}
            canSearch
            serverSideSearch={["PS Code", "Customer Name"]}
            manualPagination={true}
            totalRows={pageData.totalRows}
            totalPages={pageData.totalPages}
            recordsPerPage={recordsPerPage}
            skipCount={skipCount}
            pageChangeHandler={setSkipCount}
            recordsPerPageChangeHandler={recordsPerPageChangeHandler}
            keywordsChangeHandler={keywordsChangeHandler}
          />
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default Paginations;
