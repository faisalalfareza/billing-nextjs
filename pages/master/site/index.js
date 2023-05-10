import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import { Link } from "@mui/material";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import axios from "axios";
import DataTable from "/layout/Tables/DataTable";
import SiteRowActions from "./components/SiteRowActions";
import AddOrEditSite from "./components/AddOrEditSite";
import Icon from "@mui/material/Icon";
import MDBadgeDot from "/components/MDBadgeDot";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { Block } from "notiflix/build/notiflix-block-aio";

export default function MasterSite(props) {
  const { dataProject, dataSite } = props;
  const [listSite, setListSite] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const [dataCluster, setDataCluster] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const setSiteList = () => {
    return {
      columns: [
        { Header: "No", accessor: "no" },
        { Header: "Site ID", accessor: "siteId" },
        { Header: "Site Name", accessor: "siteName" },
        {
          Header: "Project",
          accessor: "project",
          Cell: ({ value }) => {
            return (
              <Link
                href="javascript:void(0)"
                underline="always"
                color="primary"
              >
                {value} Project Choosen
              </Link>
            );
          },
        },
        {
          Header: "Cluster",
          accessor: "cluster",
          Cell: ({ value }) => {
            return (
              <Link
                href="javascript:void(0)"
                underline="always"
                color="primary"
              >
                {value} Cluster Choosen
              </Link>
            );
          },
        },
        {
          Header: "Logo",
          accessor: "logo",
          Cell: ({ value }) => {
            return (
              <Link
                href="javascript:void(0)"
                underline="always"
                color="primary"
              >
                View
              </Link>
            );
          },
        },
        {
          Header: "Status",
          accessor: "status",
          Cell: ({ value }) => {
            return (
              <MDBadgeDot
                color={value ? "success" : "error"}
                size="sm"
                badgeContent={value ? "Active" : "Inactive"}
              />
            );
          },
        },
        {
          Header: "Action",
          accessor: "action",
          align: "center",
          sorted: true,
          Cell: ({ value }) => {
            return (
              <SiteRowActions
                record={value}
                openModalonEdit={openModalAddOrEditOnEdit}
                onDeleted={fetchData}
              />
            );
          },
        },
      ],
      rows: listSite,
    };
  };

  const openModalAddOrEditOnEdit = (record) => {
    setModalParams(record);
    setOpenModal(!openModal);
  };

  const changeModalAddOrEdit = () => {
    setOpenModal(!openModal);
    fetchData();
  };

  const openModalAddOrEditOnAdd = () => {
    setModalParams(undefined);
    setOpenModal(!openModal);
  };
  const handleClose = () => setOpenModal(false);

  const siteBlockLoadingName = "block-site";
  const fetchData = async (data) => {
    Block.standard(`.${siteBlockLoadingName}`, `Getting Site Data`);

    let response = await fetch("/api/master/site/getlistmastersite", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) setLoading(false);
    else {
      const list = [];
      const row = response.result.map((e, i) => {
        list.push({
          no: i + 1,
          project: e.siteId,
          cluster: e.siteId,
          status: e.isActive,
          siteId: e.siteId,
          siteName: e.siteName,
          action: {
            project: e.siteId,
            cluster: e.siteId,
            status: e.isActive,
            siteId: e.siteId,
            siteName: e.siteName,
          },
        });
      });
      setListSite(list);
    }

    Block.remove(`.${siteBlockLoadingName}`);
    // const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetListMasterSite`;
    // axios
    //   .get(url, {
    //     params: {
    //       MaxResultCount: 1000,
    //       SkipCount: 0,
    //     },
    //   })
    //   .then((response) => {
    //     // handle success
    //     const result = response.data.result.items;
    //     const list = [];
    //     const row = result.map((e, i) => {
    //       list.push({
    //         no: i + 1,
    //         project: e.siteId,
    //         cluster: e.siteId,
    //         status: e.isActive,
    //         siteId: e.siteId,
    //         siteName: e.siteName,
    //         action: {
    //           project: e.siteId,
    //           cluster: e.siteId,
    //           status: e.isActive,
    //           siteId: e.siteId,
    //           siteName: e.siteName,
    //         },
    //       });
    //     });
    //     setListSite(list);
    //   })
    //   .catch((error) => {
    //     // handle error
    //   });
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox mt={3}>
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-start"
          mb={2}
        >
          <MDBox display="flex">
            <MDBox>
              <MDButton
                variant="gradient"
                color="primary"
                onClick={openModalAddOrEditOnAdd}
              >
                <Icon>add</Icon>&nbsp; Add New Site
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card className={siteBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <DataTable
                  title="Master Site List"
                  description="For Site Data Maintenance"
                  table={setSiteList()}
                  canSearch
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      <AddOrEditSite
        isOpen={openModal}
        params={modalParams}
        onModalChanged={changeModalAddOrEdit}
      />
    </DashboardLayout>
  );
}
