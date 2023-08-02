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
import UsersRowActions from "./components/UsersRowActions";
import EditDataUsers from "./components/EditDataUsers";
import * as dayjs from "dayjs";

export default function Users() {
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

  useEffect(() => {}, []);

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

    if (site) {
      getTemplateInvoice();
      getBank();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const columns = [
    { Header: "No", accessor: "no", width: "5%" },
    { Header: "UserName", accessor: "userName" },
    { Header: "Name", accessor: "name" },
    { Header: "Surname", accessor: "surname" },
    { Header: "Roles", accessor: "roles" },
    {
      Header: "Email Address",
      accessor: "email",
    },
    {
      Header: "Active",
      accessor: "isActive",
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
    { Header: "Last Login Date", accessor: "lastLogin" },
    { Header: "Created Date", accessor: "createDate" },
    {
      Header: "Action",
      accessor: "action",
      align: "center",
      sorted: true,
      Cell: ({ value }) => {
        return (
          <UsersRowActions
            record={value}
            openModalonEdit={openModalEdit}
            onDeleted={fetchData}
          />
        );
      },
    },
  ];
  const [tasklist, setTasklist] = useState({ columns: columns, rows: [] });

  const usersBlockLoadingName = "block-users";
  const fetchData = async (data) => {
    Block.standard(`.${usersBlockLoadingName}`, `Getting Users Data`),
      setLoading(true);

    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/user-management/users/getall", {
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
          userName: e.userName,
          name: e.name,
          surname: e.surname,
          roles: e.roleNames.join(", "),
          email: e.emailAddress,
          bank: e.bank,
          isActive: e.isActive,
          lastLogin: e.lastLoginTime
            ? dayjs(e.lastLoginTime).format("DD MMMM YYYY")
            : "-",
          createDate: e.creationTime
            ? dayjs(e.creationTime).format("DD MMMM YYYY")
            : "-",
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

    Block.remove(`.${usersBlockLoadingName}`), setLoading(false);
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
      "/api/user-management/users/getdropdownmastertemplate",
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

  const handleExport = async () => {
    let response = await fetch(
      "/api/transaction/electric/exporttoexcelelectricreading",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            maxResultCount: 1000,
            skipCount: 0,
            siteId: site?.siteId,
            projectId: formValues.project?.projectId,
            clusterId: formValues.cluster?.clusterId,
            search: undefined,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ text: response.error.message, title: "Error" });
    else {
      downloadTempFile(response.result.uri);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox mt={3.5}>
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-start"
          mb={2}
        >
          <MDBox display="flex">
            <MDBox>
              <MDButton
                variant="outlined"
                color="primary"
                disabled={customerResponse.rowData.length == 0}
                onClick={handleExport}
              >
                <Icon>description</Icon>&nbsp;Export Excel
              </MDButton>
            </MDBox>
            <MDBox ml={1}>
              <MDButton
                ml={1}
                variant="gradient"
                color="primary"
                onClick={handleOpenUpload}
              >
                <Icon>add</Icon>&nbsp; Add New Users
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card className={usersBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12} mb={1}>
                <DataTable
                  title="Users List"
                  description="To add and maintain Users"
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
      {openEdit && (
        <EditDataUsers
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
