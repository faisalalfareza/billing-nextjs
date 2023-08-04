import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import FormField from "/pagesComponents/FormField";
import DataTable from "/layout/Tables/DataTable";
import Container from "@mui/material/Container";
import { Block } from "notiflix/build/notiflix-block-aio";

// Data
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import NumberInput from "/pagesComponents/dropdown/NumberInput";
import Header from "../Header";
import BasicInfo from "../BasicInfo";
import Roles from "../Roles";
import Site from "../Site";

function EditDataUsers(props) {
  const { isOpen, params, onModalChanged, site, listBank, listTemplate } =
    props;
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoading, setLoading] = useState(false);
  const [listItem, setListItem] = useState([]);
  const [isLoadingShow, setLoadingShow] = useState(false);
  const [dataTemplateInvoice, setDataTemplateInvoice] = useState([]);
  const [dataBank, setDataBank] = useState([]);
  const [bankEdit, setBankEdit] = useState(null);
  const [templateEdit, setTemplateEdit] = useState(null);
  const [usersHeaderId, setUsersHeaderId] = useState(null);
  const [templateInvoiceHeaderId, setTemplateInvoiceHeaderId] = useState(null);
  const formikRef = useRef();
  const [openDetail, setOpenDetail] = useState(false);

  const [tabValue, setTabValue] = useState(1);
  const [prices, setPrices] = useState(["59", "89", "99"]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);

    if (event.currentTarget.id === "annual") {
      setPrices(["119", "159", "399"]);
    } else {
      setPrices(["59", "89", "99"]);
    }
  };

  let bankE = listBank.find((e) => e.bankName == params.bank);
  let templateE = listTemplate.find(
    (e) => e.templateName == params.templateInvoice
  );

  const initialValues = {
    unitCode: params ? params.unitCode : undefined,
    unitNo: params ? params.unitNo : undefined,
    templateInvoice: params ? templateE : null,
    bank: params ? bankE : null,
    vaNo: params ? params.vaNo : undefined,
    isPenalty: params ? params.isPenalty : false,
    landArea: params ? params.landArea : false,
    buildArea: params ? params.buildArea : false,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
    console.log("formval----", formValues);
  };

  const detailUsersBlockLoadingName = "block-detail-unit-item";
  const updateUsers = async (values, actions) => {
    Block.standard(`.${detailUsersBlockLoadingName}`, `Updating Unit Item`),
      setLoading(true);

    const body = {
      usersHeaderId: params.usersHeaderId,
      unitDataId: params.unitDataId,
      unitCode: params.unitCode,
      unitNo: params.unitNo,
      templateInvoiceHeaderId: values.templateInvoice.templateInvoiceHeaderId,
      bankId: values.bank.bankID,
      vaNo: values.vaNo,
      landArea: values.landArea,
      buildArea: values.buildArea,
      isPenalty: values.isPenalty,
      itemDetail: listItem,
    };

    let response = await fetch("/api/master/users/prosesupdatemasterusers", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({
        title: "Error",
        text: response.error.error.message,
      });
    else {
      Swal.fire({
        title: "Unit Item Updated",
        text:
          "Unit " +
          params.unitCode +
          " - " +
          params.unitNo +
          " has been successfully updated.",
        icon: "success",
      }).then((result) => {
        actions.resetForm();
        closeModal(true);
      });
    }

    Block.remove(`.${detailUsersBlockLoadingName}`), setLoading(false);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  useEffect(() => {
    // getBank();
    // getTemplateInvoice();
    // if (params) {
    //   getDetail();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  useEffect(() => {
    // getBank();
    // getTemplateInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (templateInvoiceHeaderId != null) getListItem();
    else setListItem([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateInvoiceHeaderId]);

  const getDetail = async (data) => {
    Block.standard(
      `.${detailUsersBlockLoadingName}`,
      `Getting Unit Item Detail`
    ),
      setLoadingShow(true);

    let response = await fetch("/api/master/users/getdetailmasterusers", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          UsersHeaderId: params.usersHeaderId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let res = response.result;
      let bank = listBank.find((e) => e.bankID == res.bankId);
      let template = listTemplate.find(
        (e) => e.templateInvoiceHeaderId == res.templateInvoiceHeaderId
      );
      setUsersHeaderId(res.usersHeaderId);
      setTemplateInvoiceHeaderId(res.templateInvoiceHeaderId);
      setformValues((prevState) => ({
        ...prevState,
        unitCode: res.unitCode,
        unitNo: res.unitNo,
        bank: bank,
        vaNo: res.vaNo,
        landArea: res.landArea,
        buildArea: res.buildArea,
        templateInvoice: template,
        isPenalty: res.isPenalty,
      }));
      setBankEdit(bank);
      setTemplateEdit(template);
      if (formikRef.current) {
        formikRef.current.setFieldValue("unitCode", res.unitCode);
        formikRef.current.setFieldValue("unitNo", res.unitNo);
        formikRef.current.setFieldValue("bank", bank);
        formikRef.current.setFieldValue("vaNo", res.vaNo);
        formikRef.current.setFieldValue("landArea", res.landArea);
        formikRef.current.setFieldValue("buildArea", res.buildArea);
        formikRef.current.setFieldValue("templateInvoice", template);
        formikRef.current.setFieldValue("isPenalty", res.isPenalty);
      }
    }

    Block.remove(`.${detailUsersBlockLoadingName}`), setLoadingShow(false);
  };

  const listItemBlockLoadingName = "block-list-unit-item";
  const getListItem = async (data) => {
    Block.standard(`.${listItemBlockLoadingName}`, `Getting List Item Detail`),
      setLoadingShow(true);

    let response = await fetch("/api/master/users/getdetaillistmsusers", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          usersHeaderId: usersHeaderId,
          templateInvoiceHeaderId: templateInvoiceHeaderId,
          ClusterId: params.clusterId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      const result = response.result;
      console.log("result---", result);
      let list = [];
      result.map((e, i) => {
        list.push({
          no: i + 1,
          itemName: e.itemName,
          itemRateName: e.itemRateName,
          rate: e.rate,
          usersDetailId: e.usersDetailId,
          templateInvoiceDetailId: e.templateInvoiceDetailId,
        });
      });
      setListItem(list);
    }

    Block.remove(`.${listItemBlockLoadingName}`), setLoadingShow(false);
  };

  const bankBlockLoadingName = "block-bank";
  const getBank = async () => {
    Block.dots(`.${bankBlockLoadingName}`);

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

    Block.remove(`.${bankBlockLoadingName}`);
  };

  const templateInvoiceBlockLoadingName = "block-template-invoice";
  const getTemplateInvoice = async (val) => {
    Block.dots(`.${templateInvoiceBlockLoadingName}`);

    let response = await fetch("/api/master/users/getdropdownmastertemplate", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: { SiteID: site?.siteId },
      }),
    });
    if (!response.ok) throw new Error(`{Error}: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataTemplateInvoice(response.result);

    Block.remove(`.${templateInvoiceBlockLoadingName}`);
  };

  const setInvoiceList = () => {
    return {
      columns: [
        { Header: "No", accessor: "no" },
        { Header: "ITEM NAME", accessor: "itemName" },
        { Header: "ITEM RATE NAME", accessor: "itemRateName" },
        {
          Header: "Rate",
          accessor: "rate",
          align: "right",
          Cell: ({ value, row }) => {
            return (
              <NumberInput
                inputProps={{
                  style: { textAlign: "right" },
                  onBlur: (e) => {
                    rateChange(e.target.value, row.index);
                  },
                }}
                placeholder="Type Amount Payment"
                value={value}
              />
            );
          },
        },
      ],
      rows: listItem,
    };
  };

  const rateChange = (value, index) => {
    const newData = [...listItem];
    let a = value.replaceAll("Rp. ", "").replaceAll(".", "").replace(",", ".");
    let valFloat = parseFloat(a);
    newData[index].rate = valFloat;

    setListItem(newData);
  };

  const handleDetail = () => {
    setOpenDetail(!openDetail);
  };

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      unitCode: Yup.string().nullable(),
      unitNo: Yup.string().nullable(),
      templateInvoice: Yup.object()
        .required("Template Invoice is required.")
        .typeError("Template Invoice is required."),
      bank: Yup.object()
        .required("Bank is required.")
        .typeError("Bank is required."),
      vaNo: Yup.number().required("Virtual Account Number is required."),
      landArea: Yup.number().min(0).required("Land Area is required."),
      buildArea: Yup.number().min(0).required("Build Area is required."),
    });

    const checkingSuccessInput = (value, error) => {
      return value != undefined && value != "" && !error;
    };
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const submitForm = async (values, actions) => {
      // await sleep(1000);
      updateUsers(values, actions);
    };

    return (
      <Modal
        size="xl"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
        className={detailUsersBlockLoadingName}
      >
        <Header tabValue={tabValue} tabHandler={handleSetTabValue}>
          {tabValue == 1 && <BasicInfo />}
          {tabValue == 2 && <Roles />}
          {tabValue == 3 && <Site />}
        </Header>
        <MDBox pb={3} pt={6} px={6} lineHeight={1}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={12}>
              <MDTypography variant="h5">Edit Unit Item</MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        {/* <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={schemeValidations}
          onSubmit={submitForm}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            setFieldValue,
            resetForm,
          }) => {
            setformValues(values);
            getFormData(values);

            const isValifForm = () => {
              return (
                checkingSuccessInput(values.bank, errors.bank) &&
                checkingSuccessInput(
                  values.templateInvoice,
                  errors.templateInvoice
                ) &&
                checkingSuccessInput(values.vaNo, errors.vaNo) &&
                checkingSuccessInput(values.landArea, errors.landArea) &&
                checkingSuccessInput(values.buildArea, errors.buildArea)
              );
            };

            return (
              <Form id="edit-data-unit-item" autoComplete="off">
                <ModalBody>
                  <MDBox pb={3} px={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          label="Unit Code"
                          disabled
                          name="unitCode"
                          value={formValues.unitCode}
                          placeholder="Type Unit Code"
                          error={errors.unitCode && touched.unitCode}
                          success={checkingSuccessInput(
                            formValues.unitCode,
                            errors.unitCode
                          )}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          InputLabelProps={{ shrink: true }}
                          disabled
                          type="text"
                          label="Unit No"
                          name="unitNo"
                          value={formValues.unitNo}
                          placeholder="Type Unit No"
                          error={errors.unitNo && touched.unitNo}
                          success={checkingSuccessInput(
                            formValues.unitNo,
                            errors.unitNo
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Autocomplete
                          name="templateInvoice"
                          key="templateInvoice"
                          isOptionEqualToValue={(option, value) => {
                            if (value)
                              option.templateInvoiceHeaderId ===
                                value.templateInvoiceHeaderId;
                          }}
                          value={templateEdit}
                          options={listTemplate}
                          getOptionLabel={(option) => option.templateName}
                          onChange={(e, value) => {
                            setFieldValue(
                              "templateInvoice",
                              value !== null ? value : null
                            );
                            setTemplateEdit(value ? value : null);
                            setTemplateInvoiceHeaderId(
                              value ? value.templateInvoiceHeaderId : null
                            );
                          }}
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              type="text"
                              required
                              label="Template Invoice"
                              name="templateInvoice"
                              placeholder="Choose Template Invoice"
                              // InputLabelProps={{ shrink: true }}
                              error={
                                errors.templateInvoice &&
                                touched.templateInvoice
                              }
                              success={checkingSuccessInput(
                                formValues.templateInvoice,
                                errors.templateInvoice
                              )}
                              className={templateInvoiceBlockLoadingName}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <MDButton
                          variant="outlined"
                          color="primary"
                          disabled={formValues.templateInvoice == null}
                          onClick={() => {
                            handleDetail();
                          }}
                        >
                          VIEW INVOICE
                        </MDButton>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Autocomplete
                          name="bank"
                          key="bank"
                          value={bankEdit}
                          isOptionEqualToValue={(option, value) => {
                            if (value) option.bankID === value.bankID;
                          }}
                          options={listBank}
                          getOptionLabel={(option) => option.bankName}
                          onChange={(e, value) => {
                            setFieldValue(
                              "bank",
                              value !== null ? value : initialValues["bank"]
                            );
                            setBankEdit(value);
                          }}
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              required
                              type="text"
                              label="Bank"
                              name="bank"
                              placeholder="Choose Bank"
                              error={errors.bank && touched.bank}
                              success={checkingSuccessInput(
                                formValues.bank,
                                errors.bank
                              )}
                              className={bankBlockLoadingName}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          InputLabelProps={{ shrink: true }}
                          required
                          type="text"
                          label="Virtual Account Number"
                          name="vaNo"
                          value={formValues.vaNo}
                          placeholder="Type Virtual Account Number"
                          error={errors.vaNo && touched.vaNo}
                          success={checkingSuccessInput(
                            formValues.vaNo,
                            errors.vaNo
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          InputLabelProps={{ shrink: true }}
                          required
                          type="number"
                          label="Land Area"
                          name="landArea"
                          value={formValues.landArea}
                          placeholder="Type Land Area"
                          error={errors.landArea && touched.landArea}
                          success={checkingSuccessInput(
                            formValues.landArea,
                            errors.landArea
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          InputLabelProps={{ shrink: true }}
                          required
                          type="number"
                          label="Build Area"
                          name="buildArea"
                          value={formValues.buildArea}
                          placeholder="Type Build Area"
                          error={errors.buildArea && touched.buildArea}
                          success={checkingSuccessInput(
                            formValues.buildArea,
                            errors.buildArea
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="isPenalty"
                                color="primary"
                                checked={formValues.isPenalty}
                                onChange={(e) => {
                                  setFieldValue(
                                    "isPenalty",
                                    e.target.checked != null
                                      ? e.target.checked
                                      : initialValues["isPenalty"]
                                  );
                                }}
                              />
                            }
                            label="Penalty"
                          />
                        </FormGroup>
                      </Grid>
                      <Grid item xs={12}>
                        <MDBox
                          className={listItemBlockLoadingName}
                          color="dark"
                          bgColor="white"
                          borderRadius="lg"
                          shadow="lg"
                          opacity={1}
                          p={2}
                        >
                          Item Detail
                          <DataTable
                            table={setInvoiceList()}
                            showTotalEntries={false}
                            isSorted={false}
                            entriesPerPage={false}
                          />
                        </MDBox>
                      </Grid>
                    </Grid>
                  </MDBox>
                </ModalBody>
                <ModalFooter>
                  <MDBox
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </MDButton>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton
                        type="submit"
                        variant="gradient"
                        color="primary"
                        sx={{ height: "100%" }}
                        disabled={!isValifForm() || isLoading}
                      >
                        {isLoading ? "Saving.." : "Save"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik> */}
      </Modal>
    );
  }

  return false;
}

// Setting default value for the props of EditDataUsers
EditDataUsers.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the EditDataUsers
EditDataUsers.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default EditDataUsers;
