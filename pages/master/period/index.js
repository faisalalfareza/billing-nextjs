import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField } from "@mui/material";
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
import PeriodRowActions from "./components/PeriodRowActions";
import AddOrEditPeriod from "./components/AddOrEditPeriod";
import Icon from "@mui/material/Icon";
import MDBadgeDot from "/components/MDBadgeDot";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import { alertService } from "/helpers";
import { Block } from "notiflix/build/notiflix-block-aio";


export default function MasterPeriod(props) {
  const [listSite, setListSite] = useState([]);
  const [site, setSite] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  useEffect(() => {
    let currentSite = typeNormalization(localStorage.getItem("site"));
    if (currentSite == null) alertService.info({ title: "Please choose site first." });
    else setSite(currentSite);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (site) {
      fetchData();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const setSiteList = () => {
    return {
      columns: [
        { Header: "Period No", accessor: "periodNumber" },
        { Header: "Period Name", accessor: "periodName" },
        { Header: "Start Date", accessor: "startDate" },
        { Header: "End Date", accessor: "endDate" },
        { Header: "Close Date", accessor: "closeDate" },

        {
          Header: "Status",
          accessor: "isActive",
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
              <PeriodRowActions
                record={value}
                openModalonEdit={openModalAddOrEditOnEdit}
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

  const openModalAddOrEditOnAdd = () => {
    setModalParams(undefined);
    setOpenModal(!openModal);
  };

  const periodBlockLoadingName = "block-period";
  const fetchData = async () => {
    Block.standard(`.${periodBlockLoadingName}`, `Getting Period Data`);

    let response = await fetch("/api/master/period/getlistmasterperiod", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
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
          closeDate: e.closeDate,
          endDate: e.endDate,
          isActive: e.isActive,
          periodName: e.periodName,
          periodNumber: e.periodNumber,
          siteId: e.siteId,
          startDate: e.startDate,
          siteName: e.siteName,
          periodId: e.periodId,
          action: {
            closeDate: e.closeDate,
            endDate: e.endDate,
            isActive: e.isActive,
            periodName: e.periodName,
            periodNumber: e.periodNumber,
            siteId: e.siteId,
            startDate: e.startDate,
            siteName: e.siteName,
            periodId: e.periodId,
          },
        });
      });
      setListSite(list);
    }

    Block.remove(`.${periodBlockLoadingName}`);
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox
        p={3}
        color="light"
        bgColor="info"
        variant="gradient"
        borderRadius="lg"
        shadow="lg"
        opacity={1}
        mt={2}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SiteDropdown onSelectSite={handleSite} site={site} />
          </Grid>
        </Grid>
      </MDBox>

      <MDBox mt={3.5}>
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-start"
          mb={2}
        >
          <MDBox display="flex">
            <MDBox>
              <MDButton variant="gradient" color="primary" onClick={openModalAddOrEditOnAdd}>
                <Icon>add</Icon>&nbsp; Add New Period
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card className={periodBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12} mb={1}>
                <DataTable
                  title="Master Period List" description="For Period Data Maintenance"
                  table={setSiteList()}
                  canSearch
                />
              </Grid>
            </Grid>
          </MDBox> 
        </Card>
      </MDBox>

      {openModal && (
        <AddOrEditPeriod
          site={site}
          isOpen={openModal}
          params={modalParams}
          onModalChanged={(isChanged) => {
            setOpenModal(!openModal);
            (isChanged === true) && fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
}
