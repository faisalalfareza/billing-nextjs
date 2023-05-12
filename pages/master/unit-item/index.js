import Card from "@mui/material/Card";
// @mui material components
import { Grid, TextField } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDBadgeDot from "/components/MDBadgeDot";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO layout
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import DataTable from "/layout/Tables/DataTable";
import MDButton from "/components/MDButton";
import { useMaterialUIController } from "/context";
import { useCookies } from "react-cookie";
import { useEffect, useState, useRef } from "react";
import { typeNormalization, downloadTempFile } from "/helpers/utils";
import { alertService } from "/helpers";
import { Block } from "notiflix/build/notiflix-block-aio";

// Data
import UploadDataUnitItem from "./components/UploadDataUnitItem";
import UnitItemRowActions from "./components/UnitItemRowActions";
import EditDataUnitItem from "./components/EditDataUnitItem";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";

export default function UnitItem(props) {
  const [controller] = useMaterialUIController();
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [openUpload, setOpenUpload] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [site, setSite] = useState(null);
  const handleOpenUpload = () => setOpenUpload(true);
  const handleOpenEdit = () => setOpenEdit(true);
  const [isLoading, setLoading] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const formikRef = useRef();
  const [dataTemplateInvoice, setDataTemplateInvoice] = useState([]);
  const [dataBank, setDataBank] = useState([]);

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
    getBank();
  }, []);

  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: undefined,
    recordsPerPage: 10,
    skipCount: 0,
  });

  const skipCountChangeHandler = (e) => {
    customerRequest.skipCount = e;
    setCustomerRequest((prevState) => ({
      ...prevState,
      skipCount: e,
    }));
  };
  const recordsPerPageChangeHandler = (e) => {
    customerRequest.recordsPerPage = e;
    setCustomerRequest({
      ...prevState,
      recordsPerPage: e,
    });
  };
  const keywordsChangeHandler = (e) => {
    customerRequest.keywords = e;
    setCustomerRequest((prevState) => ({
      ...prevState,
      keywords: e,
    }));
  };

  useEffect(() => {
    setCustomerResponse((prevState) => ({
      ...prevState,
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }));
    fetchData();
    getTemplateInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const columns = [
    { Header: "no", accessor: "no", width: "5%" },
    { Header: "unitcode", accessor: "unitcode", width: "7%" },
    { Header: "unitno", accessor: "unitno" },
    { Header: "TEMPLATE INVOICE", accessor: "templateInvoice" },
    { Header: "bank", accessor: "bank" },
    { Header: "VIRTUAL ACCOUNT NUMBER", accessor: "vaNo", width: "25%" },
    {
      Header: "Penalty",
      accessor: "isPenalty",
      Cell: ({ value }) => {
        return (
          <MDBadgeDot
            color={value ? "success" : "error"}
            size="sm"
            badgeContent={value ? "Yes" : "No"}
          />
        );
      },
    },
    {
      Header: "action",
      accessor: "action",
      align: "center",
      sorted: true,
      Cell: ({ value }) => {
        return (
          <UnitItemRowActions
            record={value}
            openModalonEdit={openModalEdit}
            onDeleted={fetchData}
          />
        );
      },
    },
  ];
  const [tasklist, setTasklist] = useState({ columns: columns, rows: [] });

  const unitItemBlockLoadingName = "block-unit-item";
  const fetchData = async (data) => {
    Block.standard(`.${unitItemBlockLoadingName}`, `Getting Unit Item Data`),
      setLoading(true);

    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/master/unititem/getlistmasterunititem", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          MaxResultCount: recordsPerPage,
          SkipCount: skipCount,
          Search: keywords,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
      const list = [];
      data.items.map((e, i) => {
        list.push({
          no: skipCount + i + 1,
          templateInvoice: e.templateInvoice,
          vaNo: e.vaNo,
          unitcode: e.unitCode,
          unitno: e.unitNo,
          isPenalty: e.isPenalty,
          bank: e.bank,
          action: e,
        });
      });
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
    }

    Block.remove(`.${unitItemBlockLoadingName}`), setLoading(false);
  };

  const setCustomerTaskList = (list) => {
    return {
      columns: columns,
      rows: list,
    };
  };

  const openModalEdit = (record) => {
    setModalParams(record);
    setOpenEdit(true);
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  const getBank = async () => {
    let response = await fetch("/api/cashier/billing/getdropdownbank", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataBank(response.result);
  };

  const getTemplateInvoice = async (val) => {
    let response = await fetch(
      "/api/master/unititem/getdropdownmastertemplate",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: { SiteID: site?.siteId },
        }),
      }
    );
    if (!response.ok) throw new Error(`{Error}: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataTemplateInvoice(response.result);
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

      <MDBox mt={5}>
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
                onClick={handleOpenUpload}
              >
                <Icon>upload</Icon>&nbsp; UPLOAD
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card className={unitItemBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <DataTable
                  title="Master Unit Item List"
                  description="For Unit Item maintenance"
                  table={setCustomerTaskList(customerResponse.rowData)}
                  manualPagination={true}
                  totalRows={customerResponse.totalRows}
                  totalPages={customerResponse.totalPages}
                  recordsPerPage={customerRequest.recordsPerPage}
                  skipCount={customerRequest.skipCount}
                  pageChangeHandler={skipCountChangeHandler}
                  recordsPerPageChangeHandler={recordsPerPageChangeHandler}
                  keywordsChangeHandler={keywordsChangeHandler}
                  entriesPerPage={{
                    defaultValue: customerRequest.recordsPerPage,
                  }}
                  canSearch
                  pagination={{ variant: "gradient", color: "primary" }}
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      {openUpload && (
        <UploadDataUnitItem
          site={site}
          isOpen={openUpload}
          onModalChanged={(isChanged) => {
            setOpenUpload(!openUpload);
            isChanged === true && fetchData();
          }}
        />
      )}
      {openEdit && (
        <EditDataUnitItem
          listBank={dataBank}
          listTemplate={dataTemplateInvoice}
          site={site}
          isOpen={openEdit}
          params={modalParams}
          onModalChanged={(isChanged) => {
            setOpenEdit(!openEdit);
            isChanged === true && fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
}
