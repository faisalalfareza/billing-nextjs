import Card from "@mui/material/Card";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
// @mui material components
import { Grid, Checkbox } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Icon from "@mui/material/Icon";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// NextJS Material Dashboard 2 PRO layout
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import FormField from "/pagesComponents/FormField";
import Autocomplete from "@mui/material/Autocomplete";
import { useMaterialUIController } from "/context";
import { useCookies } from "react-cookie";
import * as React from "react";
import { typeNormalization, downloadTempFile } from "/helpers/utils";
import { alertService } from "/helpers";

// Data
import { useEffect, useState, useRef } from "react";
import SiteDropdown from "/pagesComponents/dropdown/Site";
import { NumericFormat } from "react-number-format";
import Image from "next/image";
import fileCheck from "/assets/images/file-check.svg";
import FindName from "./components/FindName";
import Swal from "sweetalert2";
import Adjustment from "./components/Adjustment";
import PuffLoader from "react-spinners/PuffLoader";

export default function Invoice(props) {
  const [controller] = useMaterialUIController();
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [openUpload, setOpenUpload] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [openAdjust, setOpenAdjust] = useState(false);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [dataPeriod, setDataPeriod] = useState([]);
  const [dataUnitCode, setDataUnitCode] = useState([]);
  const [dataUnitNo, setDataUnitNo] = useState([]);
  const [site, setSite] = useState(null);
  const [period, setPeriod] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list, setList] = useState([]);
  const [{ accessToken, encrypftedAccessToken }] = useCookies();
  const [isLoadingSend, setLoadingSend] = useState(false);
  const [command, setCommand] = useState(null);
  const formikRef = useRef();

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
    getProject();
    getPeriod();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: "",
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

  const getProject = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownprojectinvoice",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: val?.periodId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataProject(response.result);
    }
  };

  const getPeriod = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownperiodbysiteid",
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
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataPeriod(response.result);
    }
  };

  useEffect(() => {
    setformValues((prevState) => ({
      ...prevState,
      project: null,
      period: null,
      cluster: null,
      unitCode: null,
      unitNo: null,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue("project", null);
      formikRef.current.setFieldValue("period", null);
      formikRef.current.setFieldValue("cluster", null);
      formikRef.current.setFieldValue("unitCode", null);
      formikRef.current.setFieldValue("unitNo", null);
      formikRef.current.setFieldValue("nameF", "");
    }
    setCustomerResponse((prevState) => ({
      ...prevState,
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }));
    setCustomer(null);
    getProject();
    getPeriod();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const initialValues = {
    project: null,
    cluster: null,
    period: null,
    nameF: "",
    unitCode: null,
    unitNo: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const validations = Yup.object().shape({
    period: Yup.object()
      .required("Period is required.")
      .typeError("Period is required."),
    project: Yup.object().nullable(),
    cluster: Yup.object().nullable(),
    nameF: Yup.string().nullable(),
    unitCode: Yup.object().nullable(),
    unitNo: Yup.object().nullable(),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value != null && !error;
  };

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  const adjust = (val) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure want to make another adjustment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setModalParams(val);
        handleAdjust();
      }
    });
  };

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
      accessor: "select",
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
    { Header: "no", accessor: "no", width: "5%" },
    { Header: "period", accessor: "period", width: "25%" },
    { Header: "project", accessor: "project", width: "25%" },
    { Header: "cluster", accessor: "cluster" },
    { Header: "unitCode", accessor: "unitCode", width: "7%" },
    { Header: "unitNo", accessor: "unitNo" },
    { Header: "id client", accessor: "psCode" },
    { Header: "name", accessor: "name" },
    { Header: "invoice no", accessor: "invoiceNo" },
    { Header: "invoice name", accessor: "invoiceName" },
    {
      Header: "total tunggakan",
      accessor: "totalTunggakan",
      align: "right",
      Cell: ({ value }) => {
        return (
          <NumericFormat
            displayType="text"
            value={value}
            decimalSeparator=","
            prefix="Rp "
            thousandSeparator="."
          />
        );
      },
    },
    {
      Header: "preview tunggakan",
      accessor: "invoiceHeaderId",
      align: "center",
      Cell: ({ value }) => {
        return (
          <Image
            src={fileCheck.src}
            alt="Picture of the author"
            width={25}
            height={25}
            style={{ cursor: "pointer" }}
            onClick={() => handlePreview(value)}
          />
        );
      },
    },
    {
      Header: "action",
      accessor: "action",
      align: "center",
      Cell: ({ value }) => {
        return (
          <MDButton
            style={{ color: "#4593C4", cursor: "pointer" }}
            onClick={() => adjust(value)}
          >
            Adjustment
          </MDButton>
        );
      },
    },
  ];
  const [tasklist, setTasklist] = useState({ columns: columns, rows: [] });

  const fetchData = async (values, actions) => {
    let field = values ? values : formValues;
    if (field?.period) {
      setLoading(true);
      const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
      let response = await fetch("/api/transaction/invoice/getinvoicelist", {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            PeriodId: field.period?.periodId,
            ProjectId: field.project?.projectId,
            Cluster: field.cluster?.clusterName,
            UnitCode: field.unitCode?.unitCode,
            UnitNo: field.unitNo?.unitNo,
            psCode: customer?.psCode,
            MaxResultCount: recordsPerPage,
            SkipCount: skipCount,
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
            project: e.projectName,
            cluster: e.clusterName,
            unitCode: e.unitCode,
            unitNo: e.unitNo,
            period: e.period,
            psCode: e.psCode,
            name: e.name,
            invoiceNo: e.invoiceNo,
            invoiceName: e.invoiceName,
            invoiceHeaderId: e.invoiceHeaderId,
            select: e.invoiceHeaderId,
            totalTunggakan: e.totalTunggakan,
            action: e,
          });
        });
        setList(list);
        setCustomerResponse((prevState) => ({
          ...prevState,
          rowData: list,
          totalRows: data.totalCount,
          totalPages: Math.ceil(
            data.totalCount / customerRequest.recordsPerPage
          ),
        }));
      }
      setLoading(false);
    }
  };

  const setCustomerTaskList = (list) => {
    return {
      columns: columns,
      rows: list,
    };
  };

  const handlePreview = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getpreviewinvoicepdf",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            InvoiceId: val,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ text: response.error.message, title: "Error" });
    else {
      window.open(response.result, "_blank");
    }
  };

  const getCluster = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownclusterinvoice",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: val?.periodId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataCluster(response.result);
    }
  };

  const getUnitCode = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownunitcodebycluster",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: val?.periodId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataUnitCode(response.result);
    }
  };

  const getUnitNo = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownunitinvoice",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: val?.periodId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataUnitNo(response.result);
    }
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  const handleFind = () => {
    setOpenFind(!openFind);
  };

  const handleAdjust = () => {
    setOpenAdjust(!openAdjust);
    fetchData();
  };

  const handlePSCode = (val) => {
    setCustomer(val);
    if (formikRef.current) {
      formikRef.current.setFieldValue("nameF", val.name);
    }
  };

  useEffect(() => {
    console.log("cuss--", customer);
  }, [customer]);

  const submitForm = async (values, actions) => {
    fetchData(values, actions);
  };

  const handleCommand = async (data) => {
    setCommand(data);
    let text = "";
    switch (data) {
      case 1:
        text = "You will Re-generate invoice for this Name, are you sure ?";
        break;
      case 2:
        text = "You will send email invoice for this Name, are you sure ?";
        break;
      case 3:
        text = "You will send Whatsapp invoice for this Name, are you sure ?";
        break;
    }
    Swal.fire({
      title: "Are you sure?",
      text: text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        processCommand(data);
      }
    });
  };

  const processCommand = async (val) => {
    setLoadingSend(true);
    let url = "",
      text = "",
      title = "";
    switch (val) {
      case 1:
        url = "/api/transaction/invoice/regenerateinvoicebyinvoiceidlist";
        title = "Re-Generate Succesfull";
        text = "Re-generate for this invoice has been successfull";
        break;
      case 2:
        url = "/api/transaction/invoice/sendemailinvoicebyinvoiceheaderid";
        title = "Email has been sent";
        text = "Email has been sent successfully";
        break;
      case 3:
        url = "/api/transaction/invoice/sendwainvoice";
        title = "Whatsapp has been sent";
        text = "Whatsapp has been sent successfully";
        break;
    }
    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: isCheck,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ text: response.error.message, title: "Error" });
    else {
      alertService.success({
        text: text,
        title: title,
      });
    }
    setLoadingSend(false);
  };

  const override = {
    position: "absolute",
    zIndex: "10",
    margin: "auto",
    right: "0",
    left: "0",
    top: "0",
    bottom: "0",
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

      <PuffLoader
        cssOverride={override}
        size={250}
        color={"#10569E"}
        loading={isLoadingSend}
        speedMultiplier={1}
        aria-label="Loading Spinner"
        data-testid="loader"
      />

      <MDBox mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12}>
                    <MDBox>
                      <MDTypography variant="h5">Filter</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      innerRef={formikRef}
                      initialValues={initialValues}
                      validationSchema={validations}
                      onSubmit={submitForm}
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
                        const isValifForm = () =>
                          checkingSuccessInput(values.period, errors.period);

                        return (
                          <Form id="invoice-filter" autoComplete="off">
                            <MDBox>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    id="period-invoicet"
                                    name="period"
                                    component={Autocomplete}
                                    options={dataPeriod}
                                    getOptionLabel={(option) =>
                                      option.periodName
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                      option.periodId === value.periodId
                                    }
                                    value={formValues.period}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "period",
                                        value !== null
                                          ? value
                                          : initialValues["period"]
                                      );
                                      getProject(value);
                                      getCluster(value);
                                      getUnitNo(value);
                                      setPeriod(value);
                                      getUnitCode(value);
                                    }}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        required
                                        label="Period"
                                        name="period"
                                        placeholder="Choose Period"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.period && touched.period}
                                        success={checkingSuccessInput(
                                          formValues.period,
                                          errors.period
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={10}>
                                      <FormField
                                        type="text"
                                        label="Name"
                                        disabled
                                        name="nameF"
                                        id="namef-invoice"
                                        value={formValues.nameF}
                                        placeholder="Type Name"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.nameF && touched.nameF}
                                        success={checkingSuccessInput(
                                          formValues.nameF,
                                          errors.nameF
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <MDButton
                                        variant="text"
                                        color="info"
                                        onClick={handleFind}
                                        disabled={period == undefined}
                                      >
                                        Find
                                      </MDButton>
                                    </Grid>
                                  </Grid>
                                  <FindName
                                    isOpen={openFind}
                                    close={handleFind}
                                    site={site?.siteId}
                                    period={period?.periodId}
                                    handlePSCode={handlePSCode}
                                  />
                                  <Adjustment
                                    isOpen={openAdjust}
                                    close={handleAdjust}
                                    params={modalParams}
                                    handlePSCode={handlePSCode}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    name="project"
                                    id="project-invoicet"
                                    component={Autocomplete}
                                    options={dataProject}
                                    getOptionLabel={(option) =>
                                      option.projectCode +
                                      " - " +
                                      option.projectName
                                    }
                                    value={formValues.project}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "project",
                                        value !== null
                                          ? value
                                          : initialValues["project"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.projectId === value.projectId
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Project"
                                        name="project"
                                        placeholder="Choose Project"
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.project && touched.project
                                        }
                                        success={checkingSuccessInput(
                                          formValues.project,
                                          errors.project
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    id="cluster-invoicet"
                                    name="cluster"
                                    component={Autocomplete}
                                    options={dataCluster}
                                    getOptionLabel={(option) =>
                                      option.clusterCode +
                                      " - " +
                                      option.clusterName
                                    }
                                    value={formValues.cluster}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "cluster",
                                        value !== null
                                          ? value
                                          : initialValues["cluster"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.clusterId === value.clusterId
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Cluster"
                                        name="cluster"
                                        placeholder="Choose Cluster"
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.cluster && touched.cluster
                                        }
                                        success={checkingSuccessInput(
                                          formValues.cluster,
                                          errors.cluster
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    id="unitcode-invoicet"
                                    name="unitCode"
                                    component={Autocomplete}
                                    options={dataUnitCode}
                                    getOptionLabel={(option) => option.unitCode}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "unitCode",
                                        value !== null
                                          ? value
                                          : initialValues["unitCode"]
                                      );
                                    }}
                                    value={formValues.unitCode}
                                    isOptionEqualToValue={(option, value) =>
                                      option.unitCodeId === value.unitCodeId
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Unit Code"
                                        name="unitCode"
                                        placeholder="Choose Unit Code"
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.unitCode && touched.unitCode
                                        }
                                        success={checkingSuccessInput(
                                          formValues.unitCode,
                                          errors.unitCode
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    id="unitno-invoicet"
                                    name="unitNo"
                                    component={Autocomplete}
                                    options={dataUnitNo}
                                    getOptionLabel={(option) => option.unitNo}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "unitNo",
                                        value !== null
                                          ? value
                                          : initialValues["unitNo"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.unitId === value.unitId
                                    }
                                    value={formValues.unitNo}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Unit No"
                                        name="unitNo"
                                        placeholder="Choose Unit No"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.unitNo && touched.unitNo}
                                        success={checkingSuccessInput(
                                          formValues.unitNo,
                                          errors.unitNo
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
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
                                        disabled={isLoading || !isValifForm()}
                                      >
                                        <Icon>search</Icon>&nbsp;{" "}
                                        {isLoading ? "Searching..." : "Search"}
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
                variant="outlined"
                color="primary"
                disabled={isCheck.length == 0 || isLoadingSend}
                onClick={() => handleCommand(1)}
              >
                <Icon>add</Icon>&nbsp;{" "}
                {isLoadingSend && command == 1
                  ? "Regenerating.."
                  : "Re-Generate"}
              </MDButton>
            </MDBox>
            <MDBox ml={1}>
              <MDButton
                variant="outlined"
                color="primary"
                disabled={isCheck.length == 0 || isLoadingSend}
                onClick={() => handleCommand(2)}
              >
                <Icon>email</Icon>&nbsp;{" "}
                {isLoadingSend && command == 2
                  ? "Sending Email.."
                  : "Send Email"}
              </MDButton>
            </MDBox>
            <MDBox ml={1}>
              <MDButton
                variant="outlined"
                color="primary"
                disabled={isCheck.length == 0 || isLoadingSend}
                onClick={() => handleCommand(3)}
              >
                <WhatsAppIcon /> &nbsp;{" "}
                {isLoadingSend && command == 3
                  ? "Sending Whatsapp.."
                  : "Send Whatsapp"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <DataTable
                  title="Invoice List"
                  description="Invoice Data"
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
    </DashboardLayout>
  );
}
