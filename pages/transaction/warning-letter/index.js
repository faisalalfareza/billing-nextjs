import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import * as Yup from "yup";
// @mui material components
import { Grid, TextField } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Icon from "@mui/material/Icon";
import fileCheck from "/assets/images/file-check.svg";
import Image from "next/image";

// NextJS Material Dashboard 2 PRO layout
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import FormField from "/pagesComponents/FormField";
import Autocomplete from "@mui/material/Autocomplete";
import { Checkbox } from "@mui/material";
import { useMaterialUIController } from "/context";
import { useCookies } from "react-cookie";
import * as React from "react";
import { typeNormalization, downloadTempFile } from "/helpers/utils";
import { alertService } from "/helpers";
import Swal from "sweetalert2";
import { Block } from "notiflix/build/notiflix-block-aio";

// Data
import dataTableData from "/pagesComponents/applications/data-tables/data/dataTableData";
import { useEffect, useState } from "react";
/* import WaterRowActions from "./components/WaterRowActions";
import EditDataWater from "./components/EditDataWater"; */
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import { async } from "regenerator-runtime";
import WarningLetterPreviewModal from "./components/WarningLetterPreviewModal";
import { FormatColorResetTwoTone } from "@mui/icons-material";

export default function WarningLetter(props) {
  const [isLoading, setLoading] = useState(false);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  /* start dropdown site */
  const [site, setSite] = useState(null);
  const [isLoadingSend, setLoadingSend] = useState(false);
  const override = {
    position: "absolute",
    zIndex: "10",
    margin: "auto",
    right: "0",
    left: "0",
    top: "0",
    bottom: "0",
  };

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) alertService.info({ title: "Please choose site first." });
    else setSite(currentSite);

    // getPeriode();
    // getProject();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: "",
    recordsPerPage: 10,
    skipCount: 0,
  });
  /* end dropdown site */

  /* start dropdown project */
  const [dataPeriode, setDataPeriode] = useState([]);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [dataUnitCode, setDataUnitCode] = useState([]);
  const [dataUnitNo, setDataUnitNo] = useState([]);
  const [dataSP, setDataSP] = useState([]);
  const [dataInvoiceName, setDataInvoiceName] = useState([]);
  const [dataTxtSearch, setTxtSearch] = useState([]);

  const periodBlockLoadingName = "block-period";
  const getPeriode = async (data) => {
    Block.dots(`.${periodBlockLoadingName}`);

    let response = await fetch(
      "/api/transaction/warningletter/dropdownperiod",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
   
    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataPeriode(response.result);

    Block.remove(`.${periodBlockLoadingName}`);
  };

  useEffect(() => {
    getPeriode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]); //fungsi untuk initial fields pada saat refresh page

  const projectBlockLoadingName = "block-project";
  const onPeriodeChange = async (val) => {
    Block.dots(`.${projectBlockLoadingName}`);

    let resProject = await fetch(
      "/api/transaction/warningletter/dropdownproject",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
          },
        }),
      }
    );
    if (!resProject.ok) throw new Error(`Error: ${resProject.status}`);
    resProject = typeNormalization(await resProject.json());

    if (resProject.error) alertService.error({ title: "Error", text: resProject.error.message });
    else setDataProject(resProject.result);

    Block.remove(`.${projectBlockLoadingName}`), 
      onUnitCode(val.periodId);
  };

  const clusterBlockLoadingName = "block-cluster";
  const onProjectChange = async (val) => {
    Block.dots(`.${clusterBlockLoadingName}`), 
      setLoading(true);

    let response = await fetch(
      "/api/transaction/warningletter/GetDropdownClusterByProject",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            ProjectId: val.projectId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    
    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataCluster(response.result);

    Block.remove(`.${clusterBlockLoadingName}`), 
      setLoading(false);
  };

  const unitCodeBlockLoadingName = "block-unitCode";
  async function onUnitCode(periodeId) {
    Block.dots(`.${unitCodeBlockLoadingName}`);

    let response = await fetch(
      "/api/transaction/warningletter/dropdownunitcode",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: periodeId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataUnitCode(response.result);

    Block.remove(`.${unitCodeBlockLoadingName}`), 
      onUnitNo(periodeId);
  }

  const unitNoBlockLoadingName = "block-unitNo";
  async function onUnitNo(periodeId) {
    Block.dots(`.${unitNoBlockLoadingName}`);

    let response = await fetch(
      "/api/transaction/warningletter/dropdownunitno",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: periodeId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataUnitNo(response.result);

    Block.remove(`.${unitNoBlockLoadingName}`), 
      onSP(periodeId);
  }

  const spBlockLoadingName = "block-sp";
  async function onSP(periodeId) {
    Block.dots(`.${spBlockLoadingName}`);

    let response = await fetch("/api/transaction/warningletter/dropdownsp", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        /* params: {
          SiteId: site?.siteId,
          periodId: periodeId,
        }, */
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataSP(response.result);

    Block.remove(`.${spBlockLoadingName}`), 
      onInvoiceName(periodeId);
  }

  const invoiceBlockLoadingName = "block-invoice";
  async function onInvoiceName(periodeId) {
    Block.dots(`.${invoiceBlockLoadingName}`);

    let response = await fetch(
      "/api/transaction/warningletter/dropdowninvoicename",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: periodeId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataInvoiceName(response.result);

    Block.remove(`.${invoiceBlockLoadingName}`);
  }

  /* start form builder  */
  const form = {
    formId: "warning-letter",
    formField: {
      periode: {
        name: "periode",
        label: "Periode",
        placeholder: "Type Periode",
        type: "text",
        isRequired: true,
        errorMsg: "Periode is required.",
        defaultValue: "",
      },
      project: {
        name: "project",
        label: "Project",
        placeholder: "Type Project",
        type: "text",
        isRequired: true,
        errorMsg: "Project is required.",
        defaultValue: "",
      },
      cluster: {
        name: "cluster",
        label: "Cluster",
        placeholder: "Type Cluster",
        type: "text",
        isRequired: true,
        errorMsg: "Cluster is required.",
        defaultValue: "",
      },
      unitCode: {
        name: "unitCode",
        label: "Unit Code",
        placeholder: "Type Unit Code",
        type: "text",
        isRequired: true,
        errorMsg: "Unit Code is required.",
        defaultValue: "",
      },
      unitNo: {
        name: "unitNo",
        label: "Unit No",
        placeholder: "Type Unit No",
        type: "text",
        isRequired: true,
        errorMsg: "Unit No is required.",
        defaultValue: "",
      },
      sp: {
        name: "sp",
        label: "SP",
        placeholder: "Type SP",
        type: "text",
        isRequired: true,
        errorMsg: "SP is required.",
        defaultValue: "",
      },
      invoiceName: {
        name: "invoiceName",
        label: "Invoice Name",
        placeholder: "Type Invoice Name",
        type: "text",
        isRequired: true,
        errorMsg: "Invoice Name is required.",
        defaultValue: "",
      },
      txtSearch: {
        name: "txtSearch",
        placeholder: "Search Here",
        type: "text",
        isRequired: false,
        defaultValue: "",
      },
    },
  };

  const {
    periode,
    project,
    cluster,
    unitCode,
    unitNo,
    sp,
    invoiceName,
    /* txtSearch, */
  } = form.formField;

  const initialValues = {
    [periode.name]: null,
    [project.name]: null,
    [cluster.name]: null,
    [unitCode.name]: null,
    [unitNo.name]: null,
    [sp.name]: null,
    [invoiceName.name]: null,
    /* [txtSearch.name]: null, */
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const validations = Yup.object().shape({
    [periode.name]: Yup.object()
      .required(periode.errorMsg)
      .typeError(periode.errorMsg),
    [project.name]: Yup.object()
      .required(project.errorMsg)
      .typeError(project.errorMsg),
    [cluster.name]: Yup.object()
      .required(cluster.errorMsg)
      .typeError(cluster.errorMsg),
    [unitCode.name]: Yup.object()
      .required(unitCode.errorMsg)
      .typeError(unitCode.errorMsg),
    [unitNo.name]: Yup.object()
      .required(unitNo.errorMsg)
      .typeError(unitNo.errorMsg),
    [sp.name]: Yup.object().required(sp.errorMsg).typeError(sp.errorMsg),
    [invoiceName.name]: Yup.object()
      .required(invoiceName.errorMsg)
      .typeError(invoiceName.errorMsg),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  function mandatoryComp(param, paramReq) {
    return (
      <>
        <div style={{ display: "flex", gap: "2px" }}>
          <div>{param}</div>
          <span style={{ color: "red" }}>{paramReq ? "*" : ""}</span>
        </div>
          
      </>
    );
  }
  /* end form builder  */

  /* start load dataTableData */
  const handlerPriview = async (data) => {
  };
  /* end load dataTableData */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  /* start fungtions methode Datatable */
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const handleOpenUpload = () => setOpenUpload(true);

  const [isExpandedFilter, setExpandFilter] = useState(true);

  const warningLetterBlockLoadingName = "block-warning-letter";
  const fetchData = async (data) => {
    Block.standard(`.${warningLetterBlockLoadingName}`, `Getting Warning Letter Data`),
      setLoading(true);

    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/transaction/warningletter/list", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          PeriodId: formValues.periode?.periodId,
          ProjectId: formValues.project?.projectId,
          ClusterId: formValues.cluster?.clusterId,
          UnitNo: formValues.unitNo?.unitNo,
          sp: formValues.sp?.spId,
          MaxResultCount: recordsPerPage,
          SkipCount: skipCount,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;

      const list = [];
      data.items.map((e, i) => {
        list.push({
          checkbox: e.invoiceHeaderId,
          no: skipCount + i + 1,
          period: e.period,
          project: e.projectName,
          cluster: e.clusterName,
          invoicenumber: e.invoiceNo,
          unitcode: e.unitCode,
          unitno: e.unitNo,
          sp: e.sp,
          preview: e.invoiceHeaderId,
          prev: e.warningLetterId,
          email: e.emailCust,
          sendemaildate: e.sendEmailDate,
          /* curr: e.currentRead, */
          //action: e,
        });
      });
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
      setTimeout(() => {
        const element = document.createElement("a");
        element.href = "#warning-letter";
        element.click();
      }, 0);
    } Block.remove(`.${warningLetterBlockLoadingName}`),
      setLoading(false);
  };

  /* start export excel */
  const handleExport = async () => {
    Block.standard(`.${warningLetterBlockLoadingName}`, `Exporting Warning Letter to Excel`);

    let response = await fetch(
      "/api/transaction/warningletter/ExportToExcelWarningLetter",
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
            cluster: formValues.cluster?.clusterCode,
            unitCode: formValues.unitCode?.unitCode,
            unitNo: formValues.unitNo?.unitNo,
            invoiceName: formValues.invoiceName?.invoiceName,
            search: undefined,
            sp: formValues.sp?.sp,
            /* 
              "projectId": 0,
              "clusterId": 0,
              "cluster": "string",
              "unitCode": "string",
              "unitNo": "string",
              "invoiceName": "string",
              "search": "string",
              "sp": 0 
            */
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ text: response.error.message, title: "Error" });
    else downloadTempFile(response.result.uri);

    Block.remove(`.${warningLetterBlockLoadingName}`);
  };
  /* end export excel */

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list, setList] = useState([]);

  const handleSelectAll = (e) => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(list.map((li) => li.invoiceHeaderId));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, +id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== +id));
    }
  };

  const columns = [
    {
      Header: ({ value }) => {
        return (
          <Checkbox
            color="primary"
            type="checkbox"
            name="selectAll"
            id="selectAll"
            onChange={(e) => handleSelectAll(e.target.value)}
            checked={isCheckAll}
          />
        );
      },
      accessor: "prev",
      width: "5%",
      Cell: ({ value, row }) => {
        return (
          <Checkbox
            color="primary"
            key={row.id}
            type="checkbox"
            // name={name}
            id={value}
            onChange={(e) => handleClick(e)}
            checked={isCheck.includes(value)}
          />
        );
      },
    },
    { Header: "No", accessor: "no", width: "5%" },
    { Header: "Period", accessor: "period", width: "10%" },
    { Header: "Project", accessor: "project", width: "10%" },
    { Header: "Cluster", accessor: "cluster" },
    { Header: "Invoice Number", accessor: "invoicenumber" },
    { Header: "Unit Code", accessor: "unitcode", width: "7%" },
    { Header: "Unit No", accessor: "unitno" },
    { Header: "SP", accessor: "sp" },
    {
      Header: "Preview",
      accessor: "preview",
      align: "center",
      Cell: ({ row }) => {
        return (
          <MDButton
            style={{ color: "#4593C4", cursor: "pointer" }}
            onClick={(e) => setOpenPreview(row.original.prev)}
          >
            Preview
          </MDButton>
        );
      },
    },
    { Header: "Email Address", accessor: "email", width: "15%" },
    { Header: "Send Email Date", accessor: "sendemaildate", width: "35%" },
  ];

  //const [openModalPrev, setOpenPreview] = useState(false);

  const [tasklist, setTasklist] = useState({ columns: columns, rows: [] });
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    params: undefined,
  });
  const [modalParams, setModalParams] = useState(undefined);

  const setOpenPreview = async (record = undefined) => {
    let response = await fetch(
      "/api/transaction/warningletter/viewDetailWarLett",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            warningLetterId: record,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
    }
    setModalParams(response);
    setOpenModal({
      isOpen: !openModal.isOpen,
      params: response.result,
    });
  };

  const setCustomerTaskList = (list) => {
    return {
      columns: columns,
      rows: list,
    };
  };
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
  /* end fungtion methode Datatable */

  /* start send email */
  const sendEmail = (val) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure want to Send Email",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        gotoSendEmail();
      }
    });
  };

  const gotoSendEmail = async (e) => {
    Block.standard(`.${warningLetterBlockLoadingName}`, `Sending Email Warning Letter`),
      setLoadingSend(true);

    let response = await fetch(
      "/api/transaction/warningletter/SendEmailWarningLetter",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: isCheck,
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    
    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
      Swal.fire({
        title: "Send Email",
        icon: (response.status = true ? "success" : "danger"),
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "OK",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          fetchData();
        }
      });
    }

    Block.remove(`.${warningLetterBlockLoadingName}`),
      setLoadingSend(false);
  };
  /* end send email */

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

      <MDBox mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={11}>
                    <MDBox>
                      <MDTypography variant="h5">Filter</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <MDBox display="flex" justifyContent="flex-end">
                      <a
                        onClick={() => setExpandFilter(!isExpandedFilter)}
                        style={{ cursor: "pointer" }}
                      >
                        <MDTypography
                          variant="button"
                          color="text"
                          sx={{ lineHeight: 0 }}
                        >
                          {isExpandedFilter ? (
                            <Icon fontSize="small">expand_less</Icon>
                          ) : (
                            <Icon fontSize="small">expand_more</Icon>
                          )}
                        </MDTypography>
                      </a>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} style={{ display: isExpandedFilter ? "initial" : "none" }}>
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validations}
                      onSubmit={fetchData}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        setFieldValue,
                        resetForm,
                        /* and other goodies */
                      }) => {
                        setformValues(values);
                        getFormData(values);

                        return (
                          <Form id={form.formId} autoComplete="off">
                            <MDBox>
                              <Grid container columnSpacing={3}>
                                <Grid item xs={12} sm={12}>
                                  <Autocomplete
                                    options={dataPeriode}
                                    key={periode.name}
                                    value={values.periode}
                                    getOptionLabel={(option) =>
                                      values.periode != {}
                                        ? option.periodName
                                        : "Nothing selected"
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        periode.name,
                                        value !== null
                                          ? value
                                          : initialValues[periode.name]
                                      );
                                      onPeriodeChange(value);
                                    }}
                                    noOptionsText="No results"
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={periode.type}
                                        label={periode.label}
                                        name={periode.name}
                                        placeholder={periode.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.periode && touched.periode
                                        }
                                        success={checkingSuccessInput(
                                          periode,
                                          errors.periode
                                        )}
                                        className={periodBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    options={dataProject}
                                    key={project.name}
                                    value={values.project}
                                    getOptionLabel={(option) =>
                                      values.project != {}
                                        ? option.projectCode +
                                          " - " +
                                          option.projectName
                                        : "Nothing selected"
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        project.name,
                                        value !== null
                                          ? value
                                          : initialValues[project.name]
                                      );
                                      onProjectChange(value);
                                    }}
                                    noOptionsText="No results"
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={project.type}
                                        label={project.label} required
                                        name={project.name}
                                        placeholder={project.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.project && touched.project
                                        }
                                        success={checkingSuccessInput(
                                          project,
                                          errors.project
                                        )}
                                        className={projectBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    key={cluster.name}
                                    options={dataCluster}
                                    value={values.cluster}
                                    getOptionLabel={(option) =>
                                      option.clusterName
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        cluster.name,
                                        value !== null
                                          ? value
                                          : initialValues[cluster.name]
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={cluster.type}
                                        label={cluster.label} required
                                        name={cluster.name}
                                        placeholder={cluster.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.cluster && touched.cluster
                                        }
                                        success={checkingSuccessInput(
                                          cluster,
                                          errors.cluster
                                        )}
                                        className={clusterBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    key={unitCode.name}
                                    options={dataUnitCode}
                                    value={values.unitCode}
                                    getOptionLabel={(option) =>
                                      values.unitCode != {}
                                        ? /* option.unitCodeId +
                                          " - " + */
                                          option.unitCode
                                        : "Nothing selected"
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        unitCode.name,
                                        value !== null
                                          ? value
                                          : initialValues[unitCode.name]
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={unitCode.type}
                                        label={unitCode.label} required
                                        name={unitCode.name}
                                        placeholder={unitCode.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.unitCode && touched.unitCode
                                        }
                                        success={checkingSuccessInput(
                                          unitCode,
                                          errors.unitCode
                                        )}
                                        className={unitCodeBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    options={dataUnitNo}
                                    key={unitNo.name}
                                    value={values.unitNo}
                                    getOptionLabel={(option) =>
                                      values.unitId != {}
                                        ? option.unitNo
                                        : "Nothing selected"
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        unitNo.name,
                                        value !== null
                                          ? value
                                          : initialValues[unitNo.name]
                                      );
                                    }}
                                    noOptionsText="No results"
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={unitNo.type}
                                        label={unitNo.label} required
                                        name={unitNo.name}
                                        placeholder={unitNo.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.unitNo && touched.unitNo}
                                        success={checkingSuccessInput(
                                          unitNo,
                                          errors.unitNo
                                        )}
                                      />
                                    )}
                                    className={unitNoBlockLoadingName}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    key={sp.name}
                                    options={dataSP}
                                    value={values.spName}
                                    getOptionLabel={(option) =>
                                      values.spId != {}
                                        ? option.spName
                                        : "Nothing selected"
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        sp.name,
                                        value !== null
                                          ? value
                                          : initialValues[sp.name]
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        defaultValue={params}
                                        type={sp.type}
                                        label={sp.label} required
                                        name={sp.name}
                                        placeholder={sp.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.sp && touched.sp}
                                        success={checkingSuccessInput(
                                          sp,
                                          errors.sp
                                        )}
                                        className={spBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    key={invoiceName.name}
                                    options={dataInvoiceName}
                                    value={values.invoiceName}
                                    getOptionLabel={(option) =>
                                      /* option.templateHeaderId +
                                      " - " + */
                                      option.invoiceName
                                    }
                                    onChange={(e, value) =>
                                      setFieldValue(
                                        invoiceName.name,
                                        value !== null
                                          ? value
                                          : initialValues[invoiceName.name]
                                      )
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={invoiceName.type}
                                        label={invoiceName.label} required
                                        name={invoiceName.name}
                                        placeholder={invoiceName.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.invoiceName &&
                                          touched.invoiceName
                                        }
                                        success={checkingSuccessInput(
                                          invoiceName,
                                          errors.invoiceName
                                        )}
                                        className={invoiceBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
                                    mt={2}
                                  >
                                    <MDBox
                                      ml={{ xs: 0, sm: 1 }}
                                      mt={{ xs: 1, sm: 0 }}
                                    >
                                      <MDButton
                                        type="submit"
                                        variant="gradient"
                                        color="primary"
                                        sx={{ height: "100%" }}
                                        disabled={isLoading}
                                      >
                                        <Icon>search</Icon>&nbsp;{" "}
                                        {isLoading ?
                                          "Searching.." :
                                          "Search"
                                        }
                                      </MDButton>
                                    </MDBox>
                                  </MDBox>
                                </Grid>
                              </Grid>
                            </MDBox>
                          </Form>
                        );
                      }}
                    </Formik>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <MDBox mt={3.5} id="warning-letter">
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-start"
          mb={2}
        >
          <MDBox display="flex">
            <MDBox>
              <MDButton variant="outlined" color="primary"
                disabled={customerResponse.rowData.length == 0}
                onClick={handleExport}
              >
                <Icon>description</Icon>&nbsp;Export Excel
              </MDButton>
            </MDBox>
            <MDBox ml={1}>
              <MDButton variant="outlined" color="primary"
                onClick={(e) => sendEmail(e)}
              >
                <Icon>email</Icon>&nbsp;Send Email
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card className={warningLetterBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12} mb={1}>
                <DataTable
                  title="Warning Letter List" description="Warning Letter Data"
                  table={setCustomerTaskList(customerResponse.rowData)}
                  manualPagination={true}
                  totalRows={customerResponse.totalRows}
                  totalPages={customerResponse.totalPages}
                  recordsPerPage={customerRequest.recordsPerPage}
                  skipCount={customerRequest.skipCount}
                  pageChangeHandler={skipCountChangeHandler}
                  recordsPerPageChangeHandler={recordsPerPageChangeHandler}
                  keywordsChangeHandler={keywordsChangeHandler}
                  entriesPerPage={{ defaultValue: customerRequest.recordsPerPage }}
                  canSearch pagination={{ variant: "gradient", color: "primary" }}
                />
              </Grid>
            </Grid>
          </MDBox> 
        </Card>
      </MDBox>

      {openModal.isOpen && (
        <WarningLetterPreviewModal
          isOpen={openModal.isOpen}
          params={openModal.params}
          onModalChanged={(isChanged) => {
            setOpenModal((prevState) => ({
              ...prevState,
              isOpen: !openModal.isOpen,
            }));
          }}
        />
      )}
    </DashboardLayout>
  );
}
