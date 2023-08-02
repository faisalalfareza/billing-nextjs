import React, {useState, useEffect, useRef, useMemo} from 'react';
import {useCookies} from 'react-cookie';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';
import Swal from 'sweetalert2';
import {NumericFormat} from 'react-number-format';

import {
  Card,
  Grid,
  Icon,
  Autocomplete,
  FormGroup,
  FormControlLabel,
  TextField,
  Radio,
  Checkbox,
} from '@mui/material';
import {Block} from 'notiflix/build/notiflix-block-aio';

import MDBox from '/components/MDBox';
import MDTypography from '/components/MDTypography';
import MDButton from '/components/MDButton';
import MDInput from '/components/MDInput';

import {typeNormalization, capitalizeFirstLetter} from '/helpers/utils';
import {alertService} from '/helpers';

import DashboardLayout from '/layout/LayoutContainers/DashboardLayout';
import DashboardNavbar from '/layout/Navbars/DashboardNavbar';
import DataTable from '/layout/Tables/DataTable';
import DataTableTotal from '/layout/Tables/DataTableTotal';

import FormField from '/pagesComponents/FormField';
import SiteDropdown from '/pagesComponents/dropdown/Site';
import NumberInput from '/pagesComponents/dropdown/NumberInput';
import TotalDisable from '/pagesComponents/dropdown/TotalDisable';

import DetailBalance from './detail-balance';
import debounce from 'lodash.debounce';

function BillingPayment() {
  const [{accessToken, encryptedAccessToken}] = useCookies();

  const formikRef = useRef();
  const [site, setSite] = useState(null);
  const [first, setFirst] = useState(false);
  const [detailPaymentData, setDetailPaymentData] = useState([]);
  const [OnkeyAmountPayment, setOnkeyAmountPayment] = useState(false);

  const handleSite = siteVal => {
    setSite(siteVal);
    localStorage.setItem('site', JSON.stringify(siteVal));
  };
  useEffect(() => {
    setCustomerRequest(prevState => ({
      ...prevState,
      unitCode: '',
      unitNo: '',
      keywords: '',
      skipCount: 0,
    }));
    setCustomerResponse(prevState => ({
      ...prevState,
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue('customerName', '');
      formikRef.current.setFieldValue('unitCode', '');
      formikRef.current.setFieldValue('unitNo', '');
    }

    setDetailPaymentData([]), setSelectedUnit();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const schemeModels = {
    formId: 'billing-payment-form',
    formField: {
      customerName: {
        name: 'customerName',
        label: 'Customer Name / ID Client',
        placeholder: 'Type Customer Name or ID Client',
        type: 'text',
        isRequired: false,
        errorMsg: 'Customer Name or ID Client is required.',
        defaultValue: '',
      },
      unitCode: {
        name: 'unitCode',
        label: 'Unit Code',
        placeholder: 'Type Unit Code',
        type: 'text',
        isRequired: false,
        errorMsg: 'Unit Code is required.',
        defaultValue: '',
      },
      unitNo: {
        name: 'unitNo',
        label: 'Unit No',
        placeholder: 'Type Unit No',
        type: 'text',
        isRequired: false,
        errorMsg: 'Unit No is required.',
        defaultValue: '',
      },
    },
  };
  let {customerName, unitCode, unitNo} = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [customerName.name]: customerName.isRequired
      ? Yup.string().required(customerName.errorMsg)
      : Yup.string().notRequired(),
    [unitCode.name]: unitCode.isRequired
      ? Yup.string().required(unitCode.errorMsg)
      : Yup.string().notRequired(),
    [unitNo.name]: unitNo.isRequired
      ? Yup.string().required(unitNo.errorMsg)
      : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [customerName.name]: customerName.defaultValue,
    [unitCode.name]: unitCode.defaultValue,
    [unitNo.name]: customerName.defaultValue,
  };

  const [user, setUser] = useState(undefined);
  useEffect(() => {
    document.getElementsByName(customerName.name)[0].focus();

    let currentSite = typeNormalization(localStorage.getItem('site'));
    if (currentSite == null)
      alertService.info({title: 'Please choose site first.'});
    else {
      setSite(currentSite);
      let currentUser = typeNormalization(localStorage.getItem('informations'));
      setUser(currentUser);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isExpandedFilter, setExpandFilter] = useState(true);

  const customerBlockLoadingName = 'block-customer';
  const [isLoadingCustomer, setLoadingCustomer] = useState(false);
  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: '',
    unitCode: '',
    unitNo: '',
    recordsPerPage: 5,
    skipCount: 0,
  });
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [selectedUnit, setSelectedUnit] = useState();

  const skipCountChangeHandler = e => {
    customerRequest.skipCount = e;
    setCustomerRequest(prevState => ({
      ...prevState,
      skipCount: e,
    }));
  };
  const recordsPerPageChangeHandler = e => {
    customerRequest.recordsPerPage = e;
    setCustomerRequest(prevState => ({
      ...prevState,
      recordsPerPage: e,
    }));
  };
  const keywordsChangeHandler = e => {
    customerRequest.keywords = e;
    setCustomerRequest(prevState => ({
      ...prevState,
      keywords: e,
    }));
  };

  const getCustomerList = async () => {
    Block.standard(`.${customerBlockLoadingName}`, `Searching for Customer`),
      setLoadingCustomer(true);

    const {scheme, keywords, unitCode, unitNo, recordsPerPage, skipCount} =
      customerRequest;
    let response = await fetch('/api/cashier/reprintor/getcustomerlist', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          Search: keywords,
          UnitCode: unitCode,
          UnitNo: unitNo,
          MaxResultCount: recordsPerPage, // Rows Per Page (Fixed). Start From 1
          SkipCount: skipCount, // Increments Based On Page (Flexible). Start From 0
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({title: 'Error', text: response.error.message});
    else {
      setCustomerResponse(prevState => ({
        ...prevState,
        rowData: response.items,
        totalRows: response.totalCount,
        totalPages: Math.ceil(
          response.totalCount / customerRequest.recordsPerPage,
        ),
      }));
      setTimeout(() => {
        const element = document.createElement('a');
        element.href = '#customer';
        element.click();
      }, 0);
    }
    Block.remove(`.${customerBlockLoadingName}`), setLoadingCustomer(false);
  };
  const setCustomerTaskList = rows => {
    const {skipCount} = customerRequest;

    return {
      columns: [
        {
          Header: 'Choose',
          Cell: ({row}) => {
            return (
              <Radio
                checked={row.original == selectedUnit}
                name="radio-buttons"
                value={row.original}
                onChange={changed => {
                  if (row.original != selectedUnit) {
                    setDetailPaymentData([]);
                  }
                  setSelectedUnit(row.original);
                }}
              />
            );
          },
          // align: "center",
        },
        {
          Header: 'No',
          Cell: ({row}) => skipCount + row.index + 1,
          align: 'center',
        },
        {Header: 'Project', accessor: 'projectName'},
        {Header: 'Cluster', accessor: 'clusterName'},
        {Header: 'Unit Name', accessor: 'unitName'},
        {Header: 'Unit Code', accessor: 'unitCode'},
        {Header: 'Unit No', accessor: 'unitNo'},
        {Header: 'Customer Name', accessor: 'customerName'},
      ],
      rows: rows,
    };
  };
  useEffect(() => {
    first && getCustomerList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  useEffect(() => {}, [detailPaymentData]);

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != '' && value != null && !error;
  };
  const checkingSuccessInputWithRequired = (isRequired, value, error) => {
    return (
      (!isRequired && true) ||
      (isRequired && value != undefined && value != '' && !error)
    );
  };
  const handleCustomerSubmit = async e => {
    e != undefined && e.preventDefault();

    setDetailPaymentData([]), setSelectedUnit(), setFirst(true);

    getCustomerList();
  };

  const detailPaymentLoadingName = 'block-detail-payment';
  const [isLoadingDetailPayment, setLoadingDetailPayment] = useState(false);
  const [invoiceId, setInvoiceId] = useState(undefined);

  const getPaymentDetail = async (unitDataID, psCode) => {
    Block.standard(
      `.${detailPaymentLoadingName}`,
      `Getting Payment Detail Data`,
    ),
      setLoadingDetailPayment(true);

    const body = {
      PsCode: psCode,
      unitDataId: unitDataID,
    };
    let response = await fetch(
      '/api/cashier/billing/getpaymentdetailbypscode',
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

    if (response.error)
      alertService.warn({title: response.error.error.message});
    else {
      const result = response.result.listInvoicePayment;
      result.map(e => (e['paymentTemp'] = e.paymentAmount));
      setDetailPaymentData(result);
      setTimeout(() => {
        const element = document.createElement('a');
        element.href = '#detail-payment';
        element.click();
      }, 0);

      let newState = {...formValues};
      newState.cluster = selectedUnit.clusterName;
      newState.amountPayment = 0;
      setformValues(newState);
      let tb = result.reduce((acc, o) => acc + parseInt(o.balance), 0);
      let te = result.reduce((acc, o) => acc + parseInt(o.endBalance), 0);
      let tp = result.reduce((acc, o) => acc + parseInt(o.paymentAmount), 0);
      setTotalFooter(prevState => {
        return {
          ...prevState,
          balance: tb,
          endBalance: te,
          payment: tp,
        };
      });
    }

    Block.remove(`.${detailPaymentLoadingName}`),
      setLoadingDetailPayment(false);
  };
  const setPaymentDetail = rows => {
    return {
      columns: [
        {
          Header: 'Invoice Number',
          accessor: 'invoiceNo',
          customWidth: '110px',
        },
        {
          Header: 'Invoice Name',
          accessor: 'invoiceName',
          customWidth: '50px',
        },
        {
          Header: 'Balance',
          accessor: 'balance',
          align: 'right',
          Cell: ({value, row}) => {
            return (
              <NumericFormat
                displayType="text"
                value={value}
                decimalSeparator=","
                prefix="Rp "
                thousandSeparator="."
                renderText={value => (
                  <u
                    onClick={() => {
                      setInvoiceId(row.original.invoiceId);
                      handleDetail();
                    }}
                    style={{color: '#4593C4', cursor: 'pointer'}}>
                    {value}
                  </u>
                )}
              />
            );
          },
          customWidth: '180px',
        },
        {
          Header: 'End Balance',
          accessor: 'endBalance',
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
          customWidth: '210px',
        },
        {
          Header: 'Payment Amount',
          accessor: 'paymentAmount',
          align: 'right',
          Cell: ({value, row}) => {
            return (
              <NumberInput
                inputProps={{
                  style: {textAlign: 'right'},
                  // onBlur: (e) => {
                  //   paymentAmountChange(e.target.value, row.index);
                  // },
                  onChange: e => {
                    debouncedChangeHandler(e.target.value, row.index);
                  },
                }}
                placeholder="Type Amount Payment"
                value={value}
              />
            );
          },
          customWidth: '180px',
        },
      ],
      rows: rows,
    };
  };

  const paymentMethodBlockLoadingName = 'block-payment-method';
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const getPaymentMethod = async () => {
    Block.dots(`.${paymentMethodBlockLoadingName}`);

    let response = await fetch(
      '/api/cashier/billing/getdropdownpaymentmethod',
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

  const bankBlockLoadingName = 'block-bank';
  const [bankList, setBankList] = useState([]);
  const getBank = async () => {
    Block.dots(`.${bankBlockLoadingName}`);

    let response = await fetch('/api/cashier/billing/getdropdownbank', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({title: 'Error', text: response.error.message});
    else setBankList(response.result);

    Block.remove(`.${bankBlockLoadingName}`);
  };

  const [isLoading, setLoading] = useState(false);
  const [totalFooter, setTotalFooter] = useState({});
  const [totalAc, setTotalAc] = useState(0);
  const [charge, setCharge] = useState(0);
  const [totalPay, setTotalPay] = useState(0);
  // const [isCard, setIsCard] = useState({});
  // const [hasNote, setHasNote] = useState(false);
  // useEffect(() => {
  //   if (isCard?.paymentType == 2 || isCard?.paymentType == 3) {
  //     setHasNote(true);
  //   } else setHasNote(false);
  // }, [isCard]);
  const [openDetail, setOpenDetail] = useState(false);

  let schemeValidationsPaymentDetail = Yup.object().shape({
    cluster: Yup.string(),
    paymentMethod: Yup.object()
      .required('Payment Method is required.')
      .typeError('Payment Method is required.'),
    cardNumber: Yup.string()
      .required('Card Number is required.')
      .typeError('Card Number is required.'),
    amountPayment: Yup.string()
      .required('Amount Payment is required.')
      .typeError('Amount Payment is required.'),
    transactionDate: Yup.date()
      .required('Transaction Date is required.')
      .typeError('Transaction Date is required.'),
    bank: Yup.object().nullable(),
    remarks: Yup.string(),
    charge: Yup.string(),
  });

  var customParseFormat = require('dayjs/plugin/customParseFormat');
  dayjs.extend(customParseFormat);
  const initialValues = {
    cluster: selectedUnit?.clusterName,
    paymentMethod: null,
    cardNumber: undefined,
    amountPayment: null,
    transactionDate: dayjs().format('YYYY-MM-DD'),
    bank: null,
    remarks: undefined,
    charge: undefined,
    isPrintOR: true,
    isAddSignee: true,
  };
  const [formValues, setformValues] = useState(initialValues);

  useEffect(() => {
    if (formValues.amountPayment != undefined)
      setTotalPay(formValues.amountPayment);
    else setTotalPay(0);

    if (formValues.charge != undefined) setCharge(formValues.charge);
    else setCharge(0);
  }, [formValues]);

  const handleAmountPayment = (e, setFieldValue) => {
    var value = 0;
    var temp = 0;
    if (e.key == 'Enter' || e.keyCode == 9 || e.type == 'blur') {
      setOnkeyAmountPayment(true);

      let a = e.target.value
        .replaceAll('Rp. ', '')
        .replaceAll('.', '')
        .replace(',', '.');
      let b = parseFloat(a);

      temp = b;
      e.preventDefault();
    }
    value = isNaN(temp) || temp == '' ? 0 : temp;
    setFieldValue('amountPayment', value);
  };

  const paymentProcess = async (fields, actions) => {
    Block.standard(`.${detailPaymentLoadingName}`, `Process Payments`),
      setLoading(true);

    const body = {
      siteId: site?.siteId,
      projectId: selectedUnit.projectId,
      paymentType: fields.paymentMethod.paymentType,
      cardNumber: fields.cardNumber,
      totalPayment: fields.amountPayment,
      charge: fields.charge,
      unitDataId: selectedUnit.unitDataId,
      unitCode: selectedUnit.unitCode,
      unitNo: selectedUnit.unitNo,
      psCode: selectedUnit.psCode,
      bankId: fields.bank?.bankID,
      remarks: fields.remarks,
      listInvoicePayment: detailPaymentData,
      isAddSignee: fields.isAddSignee,
      transactionDate: fields.transactionDate,
    };

    let response = await fetch('/api/cashier/billing/paymentproses', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({
        title: 'Error',
        text: response.error.error.message,
      });
    else {
      Swal.fire({
        icon: 'success',
        title: 'Input Payment Successfull',
        text: 'Official receipt document will be displayed and will be sent to the customer via email',
      }).then(() => {
        let data = response.result;
        data != null && formValues.isPrintOR && window.open(data, '_blank');
      });
      setCustomerRequest(prevState => ({
        ...prevState,
        keywords: '',
      }));
      setCustomerResponse(prevState => ({
        ...prevState,
        rowData: [],
        totalRows: undefined,
        totalPages: undefined,
      }));

      cancel();
    }

    Block.remove(`.${detailPaymentLoadingName}`),
      actions.setSubmitting(false),
      setLoading(false);
  };

  const submitForm = async (values, actions) => {
    if (values.amountPayment != totalFooter.payment)
      alertService.warn({
        title: 'Amount payment and total payment should be balanced.',
      });
    else paymentProcess(values, actions);
  };

  const cancel = () => {
    setDetailPaymentData([]);
    setformValues(initialValues);
    setTotalFooter({});
    setTotalAc(0);
  };

  const paymentAmountChange = (value, index) => {
    setOnkeyAmountPayment(false);

    let newData = detailPaymentData.slice();
    let a = value.replaceAll('Rp. ', '').replaceAll('.', '').replace(',', '.');
    let valFloat = parseFloat(a);
    console.log('----', detailPaymentData, newData, value, index);
    let val = isNaN(valFloat) || valFloat == '' ? 0 : valFloat;
    newData[index].paymentAmount = val;

    setDetailPaymentData(newData);

    let total = newData.reduce((acc, o) => acc + parseInt(o.paymentAmount), 0);
    formValues.amountPayment = total;
    if (formValues.amountPayment != undefined)
      setTotalPay(formValues.amountPayment);
    else setTotalPay(0);
  };

  const debouncedChangeHandler = useMemo(() => {
    return debounce(paymentAmountChange, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailPaymentData, formValues]);

  useEffect(() => {
    totalChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPay, charge]);

  useEffect(() => {
    let newState = [...detailPaymentData];
    let temp = totalPay;

    newState.map((e, index) => {
      if (index + 1 === newState.length) {
        if (OnkeyAmountPayment) e.paymentAmount = temp;
      } else {
        if (OnkeyAmountPayment) {
          if (temp <= e.balance) {
            e.paymentAmount = temp;
            temp = 0;
          } else if (temp > e.balance) {
            e.paymentAmount = e.balance;
            temp -= e.balance;
          }
        }
      }
    });
    setDetailPaymentData(newState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPay]);

  const totalChange = () => {
    let t = totalPay + charge;
    setTotalAc(t);
  };

  useEffect(() => {
    let tp = detailPaymentData.reduce(
      (acc, o) => acc + parseInt(o.paymentAmount),
      0,
    );
    let n = Object.assign({}, totalFooter);
    n.payment = tp;
    setTotalFooter(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailPaymentData]);

  const handleDetail = () => {
    setOpenDetail(!openDetail);
  };

  const onHandleCharge = (val, setFieldValue) => {
    var value = 0;
    var temp = 0;
    if (val.key == 'Enter' || val.keyCode == 9 || val.type == 'blur') {
      let a = val.target.value
        .replaceAll('Rp. ', '')
        .replaceAll('.', '')
        .replace(',', '.');
      let b = parseFloat(a);

      temp = b;
      val.preventDefault();
    }

    value = isNaN(temp) || temp == '' ? 0 : temp;
    setFieldValue('charge', value);
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
        mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SiteDropdown onSelectSite={handleSite} site={site} />
          </Grid>
        </Grid>
      </MDBox>

      <MDBox mt={2} id="customer">
        <Grid container rowSpacing={5}>
          <Grid item xs={12}>
            <Card>
              <MDBox px={3} pt={3} pb={2} lineHeight={1}>
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
                        style={{cursor: 'pointer'}}>
                        <MDTypography
                          variant="button"
                          color="text"
                          sx={{lineHeight: 0}}>
                          {isExpandedFilter ? (
                            <Icon fontSize="small">expand_less</Icon>
                          ) : (
                            <Icon fontSize="small">expand_more</Icon>
                          )}
                        </MDTypography>
                      </a>
                    </MDBox>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{display: isExpandedFilter ? 'initial' : 'none'}}>
                    <Formik
                      innerRef={formikRef}
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}>
                      {({values, errors, touched}) => {
                        let {
                          customerName: customerNameV,
                          unitCode: unitCodeV,
                          unitNo: unitNoV,
                        } = values;
                        const isValifForm = () =>
                          checkingSuccessInputWithRequired(
                            customerName.isRequired,
                            customerNameV,
                            errors.customerName,
                          ); //&&
                        checkingSuccessInputWithRequired(
                          unitCode.isRequired,
                          unitCodeV,
                          errors.unitCode,
                        ) &&
                          checkingSuccessInputWithRequired(
                            unitNo.isRequired,
                            unitNoV,
                            errors.unitNo,
                          );

                        return (
                          <MDBox
                            component="form"
                            role="form"
                            onSubmit={e => handleCustomerSubmit(e)}>
                            <Grid container columnSpacing={3}>
                              <Grid item xs={12} sm={4}>
                                <FormField
                                  type={customerName.type}
                                  required={customerName.isRequired}
                                  label={customerName.label}
                                  name={customerName.name}
                                  value={customerNameV}
                                  placeholder={customerName.placeholder}
                                  error={
                                    errors.customerName && touched.customerName
                                  }
                                  success={
                                    customerName.isRequired &&
                                    checkingSuccessInputWithRequired(
                                      customerName.isRequired,
                                      customerNameV,
                                      errors.customerName,
                                    )
                                  }
                                  onKeyUp={e =>
                                    setCustomerRequest(prevState => ({
                                      ...prevState,
                                      keywords: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <FormField
                                  type={unitCode.type}
                                  required={unitCode.isRequired}
                                  label={unitCode.label}
                                  name={unitCode.name}
                                  value={unitCodeV}
                                  placeholder={unitCode.placeholder}
                                  error={errors.unitCode && touched.unitCode}
                                  success={
                                    unitCode.isRequired &&
                                    checkingSuccessInputWithRequired(
                                      unitCode.isRequired,
                                      unitCodeV,
                                      errors.unitCode,
                                    )
                                  }
                                  onKeyUp={e =>
                                    setCustomerRequest(prevState => ({
                                      ...prevState,
                                      unitCode: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <FormField
                                  type={unitNo.type}
                                  required={unitNo.isRequired}
                                  label={unitNo.label}
                                  name={unitNo.name}
                                  value={unitNoV}
                                  placeholder={unitNo.placeholder}
                                  error={errors.unitNo && touched.unitNo}
                                  success={
                                    unitNo.isRequired &&
                                    checkingSuccessInputWithRequired(
                                      unitNo.isRequired,
                                      unitNoV,
                                      errors.unitNo,
                                    )
                                  }
                                  onKeyUp={e =>
                                    setCustomerRequest(prevState => ({
                                      ...prevState,
                                      unitNo: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={2}>
                                <MDBox
                                  display="flex"
                                  flexDirection={{xs: 'column', sm: 'row'}}
                                  justifyContent="flex-end">
                                  <MDBox
                                    ml={{xs: 0, sm: 1}}
                                    mt={{xs: 1, sm: 0}}>
                                    <MDButton
                                      type="submit"
                                      variant="gradient"
                                      color="primary"
                                      sx={{height: '100%'}}
                                      disabled={
                                        !isValifForm() || isLoadingCustomer
                                      }>
                                      <Icon>search</Icon>&nbsp;{' '}
                                      {isLoadingCustomer
                                        ? 'Searching..'
                                        : 'Search'}
                                    </MDButton>
                                  </MDBox>
                                </MDBox>
                              </Grid>
                            </Grid>
                          </MDBox>
                        );
                      }}
                    </Formik>
                  </Grid>
                </Grid>
              </MDBox>
              {customerResponse.rowData.length > 0 && (
                <MDBox style={{display: isExpandedFilter ? 'initial' : 'none'}}>
                  <Grid container alignItems="center">
                    <Grid item xs={12}>
                      <MDBox pl={3}>
                        <MDTypography variant="h5">Search Result</MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <DataTable
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
                      pagination={{variant: 'gradient', color: 'primary'}}
                    />
                    <MDBox p={3} pt={0}>
                      <Grid item xs={12}>
                        <MDBox
                          display="flex"
                          flexDirection={{xs: 'column', sm: 'row'}}
                          justifyContent="center">
                          <MDBox ml={{xs: 0, sm: 1}} mt={{xs: 1, sm: 0}}>
                            <MDButton
                              type="button"
                              variant="gradient"
                              color="primary"
                              sx={{height: '100%'}}
                              onClick={() => {
                                getPaymentDetail(
                                  selectedUnit.unitDataId,
                                  selectedUnit.psCode,
                                );
                                getPaymentMethod();
                                getBank();
                              }}
                              disabled={!selectedUnit}>
                              {isLoadingDetailPayment
                                ? 'Showing this Unit..'
                                : 'Show this Unit'}
                            </MDButton>
                          </MDBox>
                        </MDBox>
                      </Grid>
                    </MDBox>
                  </Grid>
                </MDBox>
              )}
            </Card>
          </Grid>

          {detailPaymentData.length > 0 && (
            <Grid item xs={12} id="detail-payment">
              <Card className={detailPaymentLoadingName}>
                <MDBox
                  mt={-3}
                  mb={-2}
                  mx={4}
                  textAlign="center"
                  bgColor="primary"
                  borderRadius="lg"
                  shadow="xl"
                  py={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <MDTypography variant="h6" color="light">
                        CUSTOMER NAME
                      </MDTypography>
                      <MDTypography variant="body2" color="light">
                        {selectedUnit?.customerName}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={4}>
                      <MDTypography variant="h6" color="light">
                        UNIT CODE
                      </MDTypography>
                      <MDTypography variant="body2" color="light">
                        {selectedUnit?.unitCode}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={4}>
                      <MDTypography variant="h6" color="light">
                        UNIT NO
                      </MDTypography>
                      <MDTypography variant="body2" color="light">
                        {selectedUnit?.unitNo}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>
                <MDBox p={2}>
                  <MDBox
                    p={1}
                    mt={3}
                    width="100%"
                    display="flex"
                    justifyContent="space-between">
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12}>
                        <MDBox>
                          <MDTypography variant="h5">
                            Payment Detail
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12}>
                        <Formik
                          initialValues={initialValues}
                          validationSchema={schemeValidationsPaymentDetail}
                          onSubmit={submitForm}>
                          {({
                            errors,
                            touched,
                            isSubmitting,
                            setFieldValue,
                            resetForm,
                            values,
                          }) => {
                            setformValues(values);
                            const isValifForm = () => {
                              if (values.paymentMethod?.paymentType == 1) {
                                return (
                                  checkingSuccessInput(
                                    values.paymentMethod,
                                    errors.paymentMethod,
                                  ) &&
                                  checkingSuccessInput(
                                    values.amountPayment,
                                    errors.amountPayment,
                                  )
                                );
                              } else {
                                return (
                                  checkingSuccessInput(
                                    values.paymentMethod,
                                    errors.paymentMethod,
                                  ) &&
                                  checkingSuccessInput(
                                    values.amountPayment,
                                    errors.amountPayment,
                                  ) &&
                                  checkingSuccessInput(
                                    values.bank,
                                    errors.bank,
                                  ) &&
                                  checkingSuccessInput(
                                    values.cardNumber,
                                    errors.cardNumber,
                                  )
                                );
                              }
                            };
                            return (
                              <Form
                                id="payment-detail"
                                autoComplete="off"
                                fullWidth>
                                <MDBox>
                                  <Grid container columnSpacing={3}>
                                    <Grid item xs={6}>
                                      <FormField
                                        type="text"
                                        required
                                        label="Cluster"
                                        name="cluster"
                                        disabled
                                        placeholder="Type Cluster"
                                        error={
                                          errors.cluster && touched.cluster
                                        }
                                        success={checkingSuccessInput(
                                          formValues.cluster,
                                          errors.cluster,
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <FormField
                                        InputLabelProps={{shrink: true}}
                                        type="date"
                                        required
                                        label="Transaction Date"
                                        name="transactionDate"
                                        placeholder="Type Transaction Date"
                                        error={
                                          errors.transactionDate &&
                                          touched.transactionDate
                                        }
                                        success={checkingSuccessInput(
                                          formValues.transactionDate,
                                          errors.transactionDate,
                                        )}
                                      />
                                    </Grid>

                                    <Grid item xs={6}>
                                      <Field
                                        name="paymentMethod"
                                        component={Autocomplete}
                                        options={paymentMethodList}
                                        getOptionLabel={option =>
                                          option.paymentName
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            'paymentMethod',
                                            value !== null
                                              ? value
                                              : initialValues['paymentMethod'],
                                          );
                                          // setIsCard(value);
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                          option.paymentType ===
                                          value.paymentType
                                        }
                                        renderInput={params => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            required
                                            label="Payment Method"
                                            name="paymentMethod"
                                            placeholder="Choose Payment Method"
                                            InputLabelProps={{shrink: true}}
                                            error={
                                              errors.paymentMethod &&
                                              touched.paymentMethod
                                            }
                                            success={checkingSuccessInput(
                                              formValues.paymentMethod,
                                              errors.paymentMethod,
                                            )}
                                            className={
                                              paymentMethodBlockLoadingName
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Field
                                        name="bank"
                                        component={Autocomplete}
                                        options={bankList}
                                        getOptionLabel={option =>
                                          option.bankName
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            'bank',
                                            value !== null
                                              ? value
                                              : initialValues['bank'],
                                          );
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                          option.bankID === value.bankID
                                        }
                                        renderInput={params => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            label="Bank"
                                            required={
                                              formValues.paymentMethod
                                                ?.paymentType != 1
                                            }
                                            name="bank"
                                            placeholder="Choose Bank"
                                            InputLabelProps={{shrink: true}}
                                            error={errors.bank && touched.bank}
                                            success={checkingSuccessInput(
                                              formValues.bank,
                                              errors.bank,
                                            )}
                                            className={bankBlockLoadingName}
                                          />
                                        )}
                                      />
                                    </Grid>

                                    <Grid item xs={6}>
                                      <TextField
                                        fullWidth
                                        variant="standard"
                                        type="text"
                                        label="Card number"
                                        name="cardNumber"
                                        onBlur={e =>
                                          setFieldValue(
                                            'cardNumber',
                                            e?.target?.value,
                                          )
                                        }
                                        required={
                                          formValues.paymentMethod
                                            ?.paymentType != 1
                                        }
                                        placeholder="Type Card Number"
                                        error={
                                          formValues?.paymentMethod
                                            ?.paymentType != 1 &&
                                          formValues?.cardNumber == ''
                                        }
                                        helperText={
                                          formValues?.paymentMethod
                                            ?.paymentType != 1 &&
                                          formValues?.cardNumber == ''
                                            ? errors.cardNumber
                                            : ''
                                        }
                                      />
                                      <MDBox mt={0.75}>
                                        <MDTypography
                                          component="div"
                                          variant="caption"
                                          color="error"
                                          fontWeight="regular">
                                          <ErrorMessage name="cardNumber" />
                                        </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <TextField
                                        fullWidth
                                        variant="standard"
                                        type="text"
                                        label="Remarks"
                                        name="remarks"
                                        placeholder="Type Remarks"
                                        onBlur={e =>
                                          setFieldValue(
                                            'remarks',
                                            e?.target?.value,
                                          )
                                        }
                                      />
                                    </Grid>

                                    <Grid item xs={4} marginTop={2}>
                                      <NumberInput
                                        required
                                        label="Amount Payment"
                                        placeholder="Type Amount Payment"
                                        value={formValues.amountPayment}
                                        onKeyPress={e =>
                                          handleAmountPayment(e, setFieldValue)
                                        }
                                        onBlur={e => {
                                          handleAmountPayment(e, setFieldValue);
                                        }}
                                        error={
                                          errors.amountPayment &&
                                          touched.amountPayment
                                        }
                                        success={checkingSuccessInput(
                                          formValues.amountPayment,
                                          errors.amountPayment,
                                        )}
                                      />

                                      <MDBox mt={0.75}>
                                        <MDTypography
                                          component="div"
                                          variant="caption"
                                          color="error"
                                          fontWeight="regular">
                                          <ErrorMessage name="amountPayment" />
                                        </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={4} marginTop={2}>
                                      <NumberInput
                                        label="Charge"
                                        placeholder="Type Charge"
                                        value={formValues.charge}
                                        onKeyPress={e =>
                                          onHandleCharge(e, setFieldValue)
                                        }
                                        onBlur={e => {
                                          onHandleCharge(e, setFieldValue);
                                        }}
                                        error={errors.charge && touched.charge}
                                        success={checkingSuccessInput(
                                          formValues.charge,
                                          errors.charge,
                                        )}
                                      />
                                      <MDBox mt={0.75}>
                                        <MDTypography
                                          component="div"
                                          variant="caption"
                                          color="error"
                                          fontWeight="regular">
                                          <ErrorMessage name="charge" />
                                        </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={4} marginTop={3}>
                                      <TotalDisable
                                        title="Total"
                                        value={totalAc}
                                      />
                                    </Grid>

                                    <Grid item xs={12} py={3}>
                                      <MDBox
                                        color="dark"
                                        bgColor="white"
                                        borderRadius="lg"
                                        border={'1px solid lightgrey'}
                                        shadow="lg"
                                        // opacity={1}
                                        py={2}>
                                        <MDBox pb={1}>
                                          <MDTypography variant="body" ml={3}>
                                            Allocation
                                          </MDTypography>
                                        </MDBox>
                                        <DataTableTotal
                                          table={setPaymentDetail(
                                            detailPaymentData,
                                          )}
                                          showTotalEntries={false}
                                          isSorted={false}
                                          totalFooter={totalFooter}
                                          entriesPerPage={false}
                                          noEndBorder={true}
                                        />
                                      </MDBox>
                                    </Grid>
                                  </Grid>
                                </MDBox>
                                <Grid item xs={6}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          name="print-or"
                                          color="primary"
                                          checked={formValues.isPrintOR}
                                          onChange={e => {
                                            setFieldValue(
                                              'isPrintOR',
                                              e.target.checked != null
                                                ? e.target.checked
                                                : initialValues['isPrintOR'],
                                            );
                                          }}
                                        />
                                      }
                                      label="Print Official Receipt (OR)"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          name="add-signee"
                                          color="primary"
                                          checked={formValues.isAddSignee}
                                          onChange={e => {
                                            setFieldValue(
                                              'isAddSignee',
                                              e.target.checked != null
                                                ? e.target.checked
                                                : initialValues['isAddSignee'],
                                            );
                                          }}
                                        />
                                      }
                                      // label={"Add Signee : " + user?.user.name}
                                      label={
                                        <MDBox
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems={{
                                            xs: 'flex-start',
                                            sm: 'center',
                                          }}
                                          flexDirection={{
                                            xs: 'column',
                                            sm: 'row',
                                          }}>
                                          <MDTypography variant="body" pr={2}>
                                            Add Signee
                                          </MDTypography>
                                          <MDBox
                                            bgColor={'grey-100'}
                                            borderRadius="lg"
                                            // display="flex"
                                            // justifyContent="space-between"
                                            // alignItems={{ xs: "flex-start", sm: "center" }}
                                            // flexDirection={{ xs: "column", sm: "row" }}
                                            // my={3}
                                            py={1}
                                            pl={{xs: 1, sm: 12}}
                                            pr={1}>
                                            <MDTypography
                                              variant="button"
                                              fontWeight="medium"
                                              color="text">
                                              {capitalizeFirstLetter(
                                                user?.user.name,
                                              )}
                                            </MDTypography>
                                          </MDBox>
                                        </MDBox>
                                      }
                                    />
                                  </FormGroup>
                                </Grid>
                                <Grid item xs={12} mt={2}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{xs: 'column', sm: 'row'}}
                                    justifyContent="flex-end">
                                    <MDButton
                                      type="reset"
                                      variant="outlined"
                                      color="secondary"
                                      onClick={() => cancel()}>
                                      Cancel
                                    </MDButton>
                                    <MDBox
                                      ml={{xs: 0, sm: 1}}
                                      mt={{xs: 1, sm: 0}}>
                                      <MDButton
                                        type="submit"
                                        variant="gradient"
                                        color="primary"
                                        sx={{height: '100%'}}
                                        disabled={!isValifForm() || isLoading}>
                                        {isLoading ? 'Saving..' : 'Save'}
                                      </MDButton>
                                    </MDBox>
                                  </MDBox>
                                </Grid>
                              </Form>
                            );
                          }}
                        </Formik>
                      </Grid>
                    </Grid>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          )}
        </Grid>
      </MDBox>

      {openDetail && (
        <DetailBalance
          isOpen={openDetail}
          params={invoiceId}
          close={handleDetail}
        />
      )}
    </DashboardLayout>
  );
}

export default BillingPayment;
