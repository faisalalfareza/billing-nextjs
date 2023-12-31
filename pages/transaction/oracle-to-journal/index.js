import React, {useState, useEffect, useRef} from 'react';
import {useCookies} from 'react-cookie';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

import {Block} from 'notiflix/build/notiflix-block-aio';

import {
  Card,
  Grid,
  Icon,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
} from '@mui/material';

import MDBox from '/components/MDBox';
import MDTypography from '/components/MDTypography';

import {typeNormalization} from '/helpers/utils';
import {alertService} from '/helpers/alert.service';

import DashboardLayout from '/layout/LayoutContainers/DashboardLayout';
import DashboardNavbar from '/layout/Navbars/DashboardNavbar';

import FormField from '/pagesComponents/FormField';
import SiteDropdown from '../../../pagesComponents/dropdown/Site';
import {NumericFormat} from 'react-number-format';

import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

import MDButton from '/components/MDButton';
import {async, values} from 'regenerator-runtime';
import dayjs from 'dayjs';
import {resolve} from 'path';

import {downloadTempFile} from '/helpers/utils';
import DataTable from '/layout/Tables/DataTable';

function OracleToJournal({params}) {
  const [isLoading, setLoading] = useState(false);
  const [isLoadingGenerate, setLoadingGenerate] = useState(false);
  const [isLoadingExport, setLoadingExport] = useState(false);
  const [isLoadingUpload, setLoadingUpload] = useState(false);

  const [{accessToken, encryptedAccessToken}] = useCookies();
  const [site, setSite] = useState(null);

  const handleSite = siteVal => {
    setSite(siteVal);
    localStorage.setItem('site', JSON.stringify(siteVal));
  };

  const schemaModels = {
    formId: 'oracle-to-journal',
    formField: {
      periodMethod: {
        name: 'periodMethod',
        label: 'Period',
        placeholder: 'Choose Period',
        type: 'text',
        isRequired: true,
        errorMsg: 'Period is required',
        defaultValue: '',
      },
      paymentMethod: {
        name: 'paymentMethod',
        label: 'Payment Type',
        placeholder: 'Choose Payment Type',
        type: 'text',
        isRequired: true,
        errorMsg: 'Payment Type is required',
        defaultValue: '',
      },
      paymentStartDate: {
        name: 'paymentStartDate',
        label: 'Payment Start Date',
        placeholder: 'Choose Start Date',
        type: 'date',
        isRequired: true,
        errorMsg: 'Payment Start Date is required.',
        defaultValue: '',
      },
      accountingDate: {
        name: 'accountingDate',
        label: 'Accounting Date',
        placeholder: 'Choose Accounting Date',
        type: 'date',
        isRequired: true,
        errorMsg: 'Accounting Date is required.',
        defaultValue: '',
      },
      paymentEndDate: {
        name: 'paymentEndDate',
        label: 'Payment End Date',
        placeholder: 'Choose End Date',
        type: 'date',
        isRequired: true,
        errorMsg: 'Payment End Date is required.',
        defaultValue: '',
      },
    },
  };

  let {
    periodMethod,
    paymentMethod,
    paymentStartDate,
    accountingDate,
    paymentEndDate,
  } = schemaModels.formField;

  let schemeValidations = Yup.object().shape({
    [periodMethod.name]: Yup.object()
      .required(periodMethod.errorMsg)
      .typeError(periodMethod.errorMsg),
    [paymentMethod.name]: Yup.object()
      .required(paymentMethod.errorMsg)
      .typeError(paymentMethod.errorMsg),
    [paymentStartDate.name]: Yup.date()
      .required(paymentStartDate.errorMsg)
      .typeError(paymentStartDate.errorMsg),
    [accountingDate.name]: Yup.date()
      .required(accountingDate.errorMsg)
      .typeError(accountingDate.errorMsg),
    [paymentEndDate.name]: Yup.date()
      .required(paymentEndDate.errorMsg)
      .typeError(paymentEndDate.errorMsg),
  });

  const schemeInitialValues = {
    [periodMethod.name]: null,
    [paymentMethod.name]: null,
    [paymentStartDate.name]: null,
    [accountingDate.name]: null,
    [paymentEndDate.name]: null,
  };

  function mandatoryComp(param, paramReq) {
    return (
      <>
        <div style={{display: 'flex', gap: '2px'}}>
          <div>{param}</div>
          <span style={{color: 'red'}}>{paramReq ? '*' : ''}</span>
        </div>
          
      </>
    );
  }

  useEffect(() => {
    document.getElementsByName(periodMethod.name)[0].focus();

    let currentSite = typeNormalization(localStorage.getItem('site'));
    if (currentSite == null) {
      Swal.fire({
        title: 'Info!',
        text: 'Please choose Site first',
        icon: 'info',
      });
    } else {
      setSite(currentSite);
      //setformValues({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [periodMethodList, setPeriodMethodList] = useState([]);
  const [paymentMethodList, setPaymentMethodList] = useState([]);

  const getDropdownPeriodMethod = async data => {
    Block.dots(`.${periodMethodBlockLoadingName}`);

    let response = await fetch('/api/report/dropdownperiod', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({title: 'Error', text: response.error.message});
    else setPeriodMethodList(response.result);

    Block.remove(`.${periodMethodBlockLoadingName}`);
  };

  useEffect(() => {
    setformValues(prevState => ({
      ...prevState,
      periodMethod: null,
      paymentMethod: null,
      paymentStartDate: null,
      paymentEndDate: null,
      accountingDate: null,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue('periodMethod', null);
      formikRef.current.setFieldValue('paymentMethod', null);
      formikRef.current.setFieldValue('paymentStartDate', null);
      formikRef.current.setFieldValue('paymentEndDate', null);
      formikRef.current.setFieldValue('accountingDate', null);
    }

    if (site) {
      getDropdownPeriodMethod();
      getDropdownPaymentMethod();
    }

    setCustomerResponse(prevState => ({
      ...prevState,
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const getDropdownPaymentMethod = async () => {
    Block.dots(`.${paymentMethodBlockLoadingName}`);

    let response = await fetch(
      '/api/master/payment_type/getdropdownpaymenttype',
      {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      },
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({title: 'Error', text: response.error.message});
    else setPaymentMethodList(response.result);

    Block.remove(`.${paymentMethodBlockLoadingName}`);
  };

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != '' && !error;
    //return (!isRequired && true) || (isRequired && value != undefined && value != "" && !error);
  };

  const [formValues, setformValues] = useState(schemeInitialValues);

  const uploadJournalToOracle = async (values, actions) => {
    setLoadingUpload(true);

    const body = {
      siteId: site?.siteId,
      period: formValues.periodMethod?.periodId,
      paymentType: formValues.paymentMethod?.paymentTypeId,
      accountingDate: addDate(formValues.accountingDate),
      bankPayment: bnkPayment,
      paymentStartDate: addDate(formValues.paymentStartDate),
      paymentEndDate: addDate(formValues.paymentEndDate),
    };

    let response = await fetch(
      '/api/transaction/oracletojournal/UploadJournalToOracle',
      {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      },
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (!response.status == 'success')
      alertService.error({title: 'Error', text: response.errorMessage});
    else {
      //if(response.success){
      Swal.fire({
        title: 'Upload Success',
        html: `Upload to Oracle Successfully Generated`,
        icon: 'success',
        timerProgressBar: true,
        timer: 3000,
      });
      //}
    }

    setLoadingUpload(false);
  };

  const generatePaymentJournal = async (values, actions) => {
    setLoadingGenerate(true);

    const body = {
      siteId: site?.siteId,
      period: formValues.periodMethod?.periodId,
      paymentType: formValues.paymentMethod?.paymentTypeId,
      accountingDate: addDate(formValues.accountingDate),
      bankPayment: bnkPayment,
      paymentStartDate: addDate(formValues.paymentStartDate),
      paymentEndDate: addDate(formValues.paymentEndDate),
    };

    let response = await fetch(
      '/api/transaction/oracletojournal/GeneratePaymentJournal',
      {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      },
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.result.status == 'success') {
      //if(response.success){
      Swal.fire({
        title: 'Payment Journal Generated',
        html: `Payment Journal Successfully Generated`,
        icon: 'success',
        timerProgressBar: true,
        timer: 3000,
      });
      //}
      //alertService.error({ title: "Error", text: response.errorMessage});
    } else {
      Swal.fire({
        title: 'Generate Failed',
        html: `Payment Journal failed to generated`,
        icon: 'error',
        timerProgressBar: true,
        timer: 3000,
      });
    }
    setLoadingGenerate(false);
    //setLoadingPaymentJournal(false);
  };

  const getFormData = values => {};

  const addDate = val => {
    return dayjs(val).add(1, 'day');
  };

  const [bnkPayment, setbnkPayment] = useState(0);

  const handleRadio = ev => {
    setbnkPayment(ev.target.value);
  };

  const [period, setPeriod] = useState([]);

  const handlePeriod = (event, value) => setPeriod(value);

  const handleExportToExcel = async (values, actions) => {
    setLoadingExport(true);

    const body = {
      siteId: site?.siteId,
      period: formValues.periodMethod?.periodId,
      paymentType: formValues.paymentMethod?.paymentTypeId,
      accountingDate: addDate(formValues.accountingDate),
      bankPayment: bnkPayment,
      paymentStartDate: addDate(formValues.paymentStartDate),
      paymentEndDate: addDate(formValues.paymentEndDate),
    };

    let response = await fetch(
      '/api/transaction/oracletojournal/ExportToExcelJournalToOracle',
      {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      },
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      let err = response.error;
      alertService.error({
        title: 'Error',
        text: err.error.message,
      });
    } else {
      let data = response.result.uri;
      if (data != null) window.open(data, '_blank');
      else
        alertService.info({title: 'No Data', text: 'No data in this filter'});
    }
    setLoadingExport(false);
  };

  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: 0,
    totalPages: 10,
    skipCount: 0,
  });

  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    recordsPerPage: 10,
    skipCount: 0,
  });

  const [isDtBilling, setDtBilling] = useState([]);

  const fetchBillingJournal = async data => {
    Block.standard(
      `.${journalToOracleBlockLoadingName}`,
      `Getting Billing Journal Data`,
    ),
      setLoading(true);

    const {skipCount, recordsPerPage} = customerRequest;
    const body = {
      siteId: site?.siteId,
      period: formValues.periodMethod?.periodId,
      paymentType: formValues.paymentMethod?.paymentTypeId,
      accountingDate: addDate(formValues.accountingDate),
      bankPayment: bnkPayment,
      paymentStartDate: addDate(formValues.paymentStartDate),
      paymentEndDate: addDate(formValues.paymentEndDate),
      MaxResultCount: recordsPerPage,
      SkipCount: skipCount,
    };

    let response = await fetch(
      '/api/transaction/oracletojournal/FetchBillingJournalTaskList',
      {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      },
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.result.length == 0) {
      alertService.info({
        title: 'Information',
        text: 'There is no row on your data filter',
      });
    } else {
      let data = response.result;
      setDtBilling(data?.items);

      const list = [];
      data?.items?.map((e, i) => {
        list.push({
          no: skipCount + i + 1,
          projectname: e.projectName,
          clustername: e.clusterName,
          unitid: e.unitId,
          unitcode: e.unitCode,
          invoiceno: e.invoiceNo,
          receiptnumber: e.receiptNumber,
          pscode: e.psCode,
          billingdate: e.billingDate.substring(0, 10),
          invoicedate: e.invoiceDate.substring(0, 10),
          periodname: e.periodName,
          remarks: e.remarks,
          oracledesc: e.oracleDesc,
          debit: e.debit,
          kredit: e.kredit,
          coa1: e.coA1,
          coa2: e.coA2,
          coa3: e.coA3,
          coa4: e.coA4,
          coa5: e.coA5,
          coa6: e.coA6,
          coa7: e.coA7,
          groupid: e.groupId,
        });
      });

      setCustomerResponse(prevState => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
    }

    Block.remove(`.${journalToOracleBlockLoadingName}`), setLoading(false);
  };

  const searchData = async data => {
    Block.standard(
      `.${journalToOracleBlockLoadingName}`,
      `Getting Journal Data`,
    ),
      setLoading(true);

    const {skipCount, recordsPerPage} = customerRequest;
    const body = {
      siteId: site?.siteId,
      period: formValues.periodMethod?.periodId,
      paymentType: formValues.paymentMethod?.paymentTypeId,
      accountingDate: addDate(formValues.accountingDate),
      bankPayment: bnkPayment,
      paymentStartDate: addDate(formValues.paymentStartDate),
      paymentEndDate: addDate(formValues.paymentEndDate),
      skipCount: skipCount,
      maxResultCount: recordsPerPage,
    };

    let response = await fetch(
      '/api/transaction/oracletojournal/FetchJournalOracleList',
      {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      },
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      alertService.error({
        title: 'Error',
        text: response.error.message,
      });
    } else {
      let data = response.result;

      setDtBilling = data;

      const list = [];
      data.items.map((e, i) => {
        list.push({
          no: i + 1,
          journalid: e.journalHeaderId,
          project: e.projectId,
          cluster: e.clusterId,
          journaldate: e.journalDate.substring(0, 10),
          oracledesc: e.oracleDesc,
          accountingdate: e.accountingDate.substring(0, 10),
          paymentdate: e.paymentDate.substring(0, 10),
          periodname: e.periodName,
          coa1: e.coA1,
          coa2: e.coA2,
          coa3: e.coA3,
          coa4: e.coA4,
          coa5: e.coA5,
          coa6: e.coA6,
          coa7: e.coA7,
          debit: e.debit,
          kredit: e.kredit,
          istransfered: e.isTransfered,
          groupId: e.groupId,
        });
      });

      setCustomerResponse(prevState => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
    }
    Block.remove(`.${journalToOracleBlockLoadingName}`), setLoading(false);
  };

  useEffect(() => {
    //searchData();
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const setCustomerTaskList = list => {
    return {
      columns: columns,
      rows: list,
    };
  };

  const skipCountChangeHandler = e => {
    customerRequest.skipCount = e;
    setCustomerRequest(prevState => ({
      ...prevState,
      skipCount: e,
    }));
  };

  const recordsPerPageChangeHandler = e => {
    customerRequest.recordsPerPage = e;
    setCustomerRequest({
      ...prevState,
      recordsPerPage: e,
    });
  };

  const columns = [
    // no: i + 1,
    // projectname: e.projectName,
    // clustername: e.clusterName,
    // unitid: e.unitId,
    // unitcode: e.unitCode,
    // invoiceno: e.invoiceNo,
    // receiptnumber: e.receiptNumber,
    // pscode: e.psCode,
    // billingdate: e.billingDate.substring(0, 10),
    // invoicedate: e.invoiceDate.substring(0, 10),
    // periodid: e.periodId,
    // remarks: e.remarks,
    // billingpaymentamount: e.billingPaymentAmount
    {Header: 'no', accessor: 'no', width: '5%'},
    {Header: 'projectname', accessor: 'projectname', width: '15%'},
    {Header: 'clustername', accessor: 'clustername', width: '15%'},
    {Header: 'unitid', accessor: 'unitid', width: '5%'},
    {Header: 'unitcode', accessor: 'unitcode', width: '5%'},
    {Header: 'invoiceno', accessor: 'invoiceno', width: '10%'},
    {Header: 'receiptnumber', accessor: 'receiptnumber', width: '10%'},
    {Header: 'pscode', accessor: 'pscode', width: '5%'},
    {Header: 'billingdate', accessor: 'billingdate', width: '5%'},
    {Header: 'invoicedate', accessor: 'invoicedate', width: '10%'},
    {Header: 'periodname', accessor: 'periodname', width: '5%'},
    {Header: 'remarks', accessor: 'remarks', width: '5%'},
    {Header: 'oracledesc', accessor: 'oracledesc', width: '10%'},
    {
      Header: 'debit',
      accessor: 'debit',
      width: '15%',
      align: 'right',
      Cell: ({value}) => {
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
      Header: 'kredit',
      accessor: 'kredit',
      width: '15%',
      align: 'right',
      Cell: ({value}) => {
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
    {Header: 'coa1', accessor: 'coa1', width: '5%'},
    {Header: 'coa2', accessor: 'coa2', width: '5%'},
    {Header: 'coa3', accessor: 'coa3', width: '5%'},
    {Header: 'coa4', accessor: 'coa4', width: '5%'},
    {Header: 'coa5', accessor: 'coa5', width: '5%'},
    {Header: 'coa6', accessor: 'coa6', width: '5%'},
    {Header: 'coa7', accessor: 'coa7', width: '5%'},
    {Header: 'groupid', accessor: 'groupid', width: '5%'},
    // {Header: "no", accessor: "no", width: "5%"},
    // {Header: "journalid", accessor: "journalid", width: "10%"},
    // {Header: "project", accessor: "project", width: "15%"},
    // {Header: "cluster", accessor: "cluster", width: "15%"},
    // {Header: "journaldate", accessor: "journaldate", width: "15%"},
    // {Header: "periodname", accessor: "periodname", width: "20%"},
    // {Header: "oracledesc", accessor: "oracledesc", width: "25%"},
    // {Header: "accountingdate", accessor: "accountingdate", width: "15%"},
    // {Header: "paymentdate", accessor: "paymentdate", width: "15%"},
    // {Header: "coa1", accessor: "coa1", width: "10%"},
    // {Header: "coa2", accessor: "coa2", width: "10%"},
    // {Header: "coa3", accessor: "coa3", width: "10%"},
    // {Header: "coa4", accessor: "coa4", width: "10%"},
    // {Header: "coa5", accessor: "coa5", width: "10%"},
    // {Header: "coa6", accessor: "coa6", width: "10%"},
    // {Header: "coa7", accessor: "coa7", width: "10%"},
    // {
    //     Header: "debit",
    //     accessor: "debit",
    //     width: "10%",
    //     align: "right",
    //     Cell: ({ value }) => {
    //         return (
    //             <NumericFormat
    //             displayType="text"
    //             value={value}
    //             decimalSeparator=","
    //             prefix="Rp "
    //             thousandSeparator="."
    //             />
    //         );
    //     },
    // },
    // {
    //     Header: "kredit",
    //     accessor: "kredit",
    //     width: "10%",
    //     align: "right",
    //     Cell: ({ value }) => {
    //         return (
    //             <NumericFormat
    //             displayType="text"
    //             value={value}
    //             decimalSeparator=","
    //             prefix="Rp "
    //             thousandSeparator="."
    //             />
    //         );
    //     },
    // },
    // {Header: "istransfered", accessor: "istransfered", width: "10%"},
    // {Header: "groupid", accessor: "groupid", width: "10%"},
  ];

  const periodMethodBlockLoadingName = 'block-period';
  const paymentMethodBlockLoadingName = 'block-period';
  const journalToOracleBlockLoadingName = 'block-warning-oracle';

  const formikRef = useRef();

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
        mb={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <SiteDropdown onSelectSite={handleSite} site={site} />
          </Grid>
        </Grid>
      </MDBox>
      <MDBox mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center">
                  <Grid item xs={12} md={8} mb={2} style={{paddingBottom: 20}}>
                    <MDBox>
                      <MDTypography variant="h5">
                        Oracle To Journal
                      </MDTypography>
                      <FormLabel
                        id="demo-radio-buttons-group-label"
                        style={{fontSize: '12px'}}>
                        Billing Transaction To Oracle
                      </FormLabel>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      innerRef={formikRef}
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}>
                      {({values, errors, touched, setFieldValue}) => {
                        // let {
                        //     periodMethod: periodMethodV,
                        //     paymentMethod: paymentMethodV,
                        // } = values;
                        setformValues(values);
                        getFormData(values);

                        const isValifForm = () =>
                          checkingSuccessInput(
                            values.periodMethod,
                            errors.periodMethod,
                          ) &&
                          checkingSuccessInput(
                            values.paymentMethod,
                            errors.paymentMethod,
                          ) &&
                          checkingSuccessInput(
                            values.paymentStartDate,
                            errors.paymentStartDate,
                          ) &&
                          checkingSuccessInput(
                            values.paymentEndDate,
                            errors.paymentEndDate,
                          ) &&
                          checkingSuccessInput(
                            values.accountingDate,
                            errors.accountingDate,
                          );

                        return (
                          <Form id={schemaModels.formId} autoComplete="off">
                            <MDBox lineHeight={2}>
                              <Grid container spacing={3}>
                                <Grid item xs={6} sm={6}>
                                  <Autocomplete
                                    style={{paddingBottom: 20}}
                                    options={periodMethodList}
                                    key={periodMethod.name}
                                    value={values.periodMethod}
                                    getOptionLabel={option =>
                                      values.periodName != {}
                                        ? option.periodName
                                        : 'Nothing Selected'
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        periodMethod.name,
                                        value !== null
                                          ? value
                                          : initialValues[periodMethod.name],
                                      );
                                    }}
                                    noOptionsText="No results"
                                    renderInput={params => (
                                      <FormField
                                        {...params}
                                        type={periodMethod.type}
                                        label={
                                          periodMethod.label +
                                          (periodMethod.isRequired
                                            ? ' ⁽*⁾'
                                            : '')
                                        }
                                        name={periodMethod.name}
                                        placeholder={periodMethod.placeholder}
                                        InputLabelProps={{shrink: true}}
                                        error={
                                          errors.periodMethod &&
                                          touched.periodMethod
                                        }
                                        success={checkingSuccessInput(
                                          periodMethod,
                                          errors.periodMethod,
                                        )}
                                        className={periodMethodBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <FormField
                                    style={{paddingBottom: 20}}
                                    type={accountingDate.type}
                                    label={
                                      accountingDate.label +
                                      (accountingDate.isRequired ? ' ⁽*⁾' : '')
                                    }
                                    name={accountingDate.name}
                                    // value={formValues.startDate}
                                    placeholder={accountingDate.placeholder}
                                    error={
                                      errors.accountingDate &&
                                      touched.accountingDate
                                    }
                                    success={checkingSuccessInput(
                                      formValues.accountingDate,
                                      errors.accountingDate,
                                    )}
                                    InputLabelProps={{shrink: true}}
                                  />
                                </Grid>
                              </Grid>
                              <Grid container spacing={3}>
                                <Grid item xs={6} sm={6}>
                                  <Autocomplete
                                    style={{paddingBottom: 20}}
                                    options={paymentMethodList}
                                    key={paymentMethod.name}
                                    value={values.paymentMethod}
                                    getOptionLabel={option =>
                                      values.paymentMethod != {}
                                        ? option.paymentTypeName
                                        : 'Nothing Selected'
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        paymentMethod.name,
                                        value !== null
                                          ? value
                                          : initialValues[paymentMethod.name],
                                      );
                                    }}
                                    noOptionsText="No results"
                                    renderInput={params => (
                                      <FormField
                                        {...params}
                                        type={paymentMethod.type}
                                        label={
                                          paymentMethod.label +
                                          (paymentMethod.isRequired
                                            ? ' ⁽*⁾'
                                            : '')
                                        }
                                        name={paymentMethod.name}
                                        placeholder={paymentMethod.placeholder}
                                        InputLabelProps={{shrink: true}}
                                        error={
                                          errors.paymentMethod &&
                                          touched.paymentMethod
                                        }
                                        success={checkingSuccessInput(
                                          paymentMethod,
                                          errors.paymentMethod,
                                        )}
                                        className={
                                          paymentMethodBlockLoadingName
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <FormControl style={{paddingBottom: 20}}>
                                    <FormLabel
                                      id="demo-radio-buttons-group-label"
                                      style={{fontSize: '12px'}}>
                                      Bank Payment
                                    </FormLabel>
                                    <RadioGroup
                                      row
                                      aria-labelledby="demo-radio-buttons-group-label"
                                      defaultValue={0}
                                      name="radio-buttons-group"
                                      onChange={handleRadio}>
                                      <FormControlLabel
                                        value={0}
                                        control={<Radio />}
                                        label="BCA"
                                      />
                                      <FormControlLabel
                                        value={1}
                                        control={<Radio />}
                                        label="Non BCA"
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                </Grid>
                              </Grid>
                              <Grid
                                container
                                spacing={3}
                                style={{paddingBottom: 20}}>
                                <Grid item xs={6} sm={6}>
                                  <FormField
                                    style={{paddingBottom: 20}}
                                    type={paymentStartDate.type}
                                    label={
                                      paymentStartDate.label +
                                      (paymentStartDate.isRequired
                                        ? ' ⁽*⁾'
                                        : '')
                                    }
                                    name={paymentStartDate.name}
                                    // value={formValues.startDate}
                                    placeholder={paymentStartDate.placeholder}
                                    error={
                                      errors.paymentStartDate &&
                                      touched.paymentStartDate
                                    }
                                    success={checkingSuccessInput(
                                      formValues.paymentStartDate,
                                      errors.paymentStartDate,
                                    )}
                                    InputLabelProps={{shrink: true}}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <FormField
                                    style={{paddingBottom: 20}}
                                    type={paymentEndDate.type}
                                    label={
                                      paymentEndDate.label +
                                      (paymentEndDate.isRequired ? ' ⁽*⁾' : '')
                                    }
                                    name={paymentEndDate.name}
                                    // value={formValues.startDate}
                                    placeholder={paymentEndDate.placeholder}
                                    error={
                                      errors.paymentEndDate &&
                                      touched.paymentEndDate
                                    }
                                    success={checkingSuccessInput(
                                      formValues.paymentEndDate,
                                      errors.paymentEndDate,
                                    )}
                                    InputLabelProps={{shrink: true}}
                                  />
                                </Grid>
                              </Grid>
                            </MDBox>
                            <MDBox lineHeight={2} style={{textAlign: 'right'}}>
                              <Grid item xs={12}>
                                <MDButton
                                  style={{marginRight: 20}}
                                  variant="outlined"
                                  color="dark"
                                  onClick={fetchBillingJournal}
                                  disabled={isLoading || !isValifForm()}>
                                  <Icon>search_outlined</Icon>&nbsp;{' '}
                                  {isLoading ? 'Searching...' : 'Search'}
                                </MDButton>
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
      <MDBox mt={3.5} id="oracle">
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-start"
          mb={2}>
          <MDBox display="flex">
            <MDButton
              style={{marginRight: 20}}
              variant="outlined"
              color="dark"
              onClick={generatePaymentJournal}
              disabled={isDtBilling.length == 0 || isLoadingGenerate}>
              <Icon>add_outlined</Icon>&nbsp;{' '}
              {isLoadingGenerate
                ? 'Generate Payment Journal...'
                : 'Generate Payment Journal'}
            </MDButton>
            <MDButton
              style={{marginRight: 20}}
              variant="outlined"
              color="dark"
              onClick={handleExportToExcel}
              disabled={isDtBilling.length == 0 || isLoadingExport}>
              <Icon>article_outlined</Icon>&nbsp;{' '}
              {isLoadingExport ? 'Export to Excel...' : 'Export to Excel'}
            </MDButton>
            <MDButton
              variant="gradient"
              color="primary"
              sx={{height: '100%'}}
              onClick={uploadJournalToOracle}
              disabled={isDtBilling.length == 0 || isLoadingUpload}>
              <Icon>upload</Icon>&nbsp;{' '}
              {isLoadingUpload ? 'Upload to Oracle...' : 'Upload to Oracle'}
            </MDButton>
          </MDBox>
        </MDBox>
        <Card className={journalToOracleBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <DataTable
                  title="Oracle To Journal"
                  description="List of Billing Payment"
                  table={setCustomerTaskList(customerResponse.rowData)}
                  manualPagination={true}
                  totalRows={customerResponse.totalRows}
                  totalPages={customerResponse.totalPages}
                  recordsPerPage={customerResponse.recordsPerPage}
                  skipCount={customerRequest.skipCount}
                  pageChangeHandler={skipCountChangeHandler}
                  recordsPerPageChangeHandler={recordsPerPageChangeHandler}
                  entriesPerPage={{
                    defaultValue: customerRequest.recordsPerPage,
                  }}
                  pagination={{variant: 'gradient', color: 'primary'}}
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default OracleToJournal;
