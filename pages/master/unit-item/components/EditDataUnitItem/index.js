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

// Data
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import NumberInput from "/pagesComponents/dropdown/NumberInput";

function EditDataUnitItem({ isOpen, params, onModalChanged, site }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoading, setLoading] = useState(false);
  const [listItem, setListItem] = useState([]);
  const [isLoadingShow, setLoadingShow] = useState(false);
  const [dataTemplateInvoice, setDataTemplateInvoice] = useState([]);
  const [dataBank, setDataBank] = useState([]);
  const formikRef = useRef();

  console.log("params----", params);
  const initialValues = {
    unitCode: params ? params.prevRead : undefined,
    unitNo: params ? params.currentRead : undefined,
    templateInvoice: params ? params.currentRead : null,
    bank: params ? params.currentRead : null,
    vaNo: params ? params.currentRead : undefined,
    isPenalty: params ? params.isPenalty : false,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const updateUnitItem = async (values, actions) => {
    const body = {
      unitItemHeaderId: params.unitItemHeaderId,
      unitDataId: params.unitDataId,
      unitCode: params.unitCode,
      unitNo: params.unitNo,
      templateInvoiceHeaderId: values.templateInvoice.templateInvoiceHeaderId,
      bankId: values.bank.bankID,
      vaNo: values.vaNo,
      isPenalty: values.isPenalty,
      itemDetail: listItem,
    };
    console.log("body----", body);

    let response = await fetch(
      "/api/master/unititem/prosesupdatemasterunititem",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      alertService.error({
        text: response.error.error.message,
        title: "Error",
      });
      setLoading(false);
      actions.resetForm();
      closeModal();
    } else {
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
        setLoading(false);
        actions.resetForm();
        closeModal();
      });
    }
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(), 0);
  };

  useEffect(() => {
    if (params) {
      getBank();
      getTemplateInvoice();
      getDetail();
    }
  }, [params]);
  useEffect(() => {
    getBank();
    getTemplateInvoice();
  }, []);

  const getDetail = async (data) => {
    setLoadingShow(true);
    let response = await fetch("/api/master/unititem/getdetailmasterunititem", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          UnitItemHeaderId: params.unitItemHeaderId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      const error = response.error;
      setLoadingShow(false);
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      const result = response.result.itemDetail;
      let res = response.result;
      let list = [];
      result.map((e, i) => {
        list.push({
          no: i + 1,
          itemName: e.itemName,
          itemRateName: e.itemRateName,
          rate: e.rate,
        });
      });
      setListItem(list);
      setformValues((prevState) => ({
        ...prevState,
        unitCode: res.unitCode,
        unitNo: res.unitNo,
        bank: res.bankId,
        vaNo: res.vaNo,
        templateInvoice: res.templateInvoiceHeaderId,
        isPenalty: res.isPenalty,
      }));
      if (formikRef.current) {
        let bank = dataBank.find((e) => e.bankID == res.bankId);
        let template = dataTemplateInvoice.find(
          (e) => e.templateInvoiceHeaderId == res.templateInvoiceHeaderId
        );
        formikRef.current.setFieldValue("unitCode", res.unitCode);
        formikRef.current.setFieldValue("unitNo", res.unitNo);
        formikRef.current.setFieldValue("bank", bank);
        formikRef.current.setFieldValue("vaNo", res.vaNo);
        formikRef.current.setFieldValue("templateInvoice", template);
        formikRef.current.setFieldValue("isPenalty", res.isPenalty);
      }
      setLoadingShow(false);
    }
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

    if (response.error) {
      setLoading(false);
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataBank(response.result);
    }
  };

  const getTemplateInvoice = async (val) => {
    let response = await fetch(
      "/api/master/unititem/getdropdownmastertemplate",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      }
    );
    if (!response.ok) throw new Error(`{Error}: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataTemplateInvoice(response.result);
    }
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
                    console.log("foo bar", e.target.value);
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

  const handleShow = () => {
    window.open(formValues.templateInvoice.urltemplate, "_blank");
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
      updateUnitItem(values, actions);
    };

    return (
      <Modal
        size="lg"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
      >
        <MDBox pb={3} pt={6} px={6} lineHeight={1}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={12}>
              <MDTypography variant="h5">Edit Unit Item</MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <Formik
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
                checkingSuccessInput(values.vaNo, errors.vaNo)
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
                          value={formValues.templateInvoice}
                          options={dataTemplateInvoice}
                          getOptionLabel={(option) => option.templateName}
                          onChange={(e, value) => {
                            setFieldValue(
                              "templateInvoice",
                              value !== null
                                ? value
                                : initialValues["templateInvoice"]
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
                            // handleDetail();
                            handleShow();
                          }}
                        >
                          VIEW INVOICE
                        </MDButton>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Autocomplete
                          name="bank"
                          key="bank"
                          value={formValues.bank}
                          isOptionEqualToValue={(option, value) => {
                            if (value) option.bankID === value.bankID;
                          }}
                          options={dataBank}
                          getOptionLabel={(option) => option.bankName}
                          onChange={(e, value) => {
                            setFieldValue(
                              "bank",
                              value !== null ? value : initialValues["bank"]
                            );
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
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          InputLabelProps={{ shrink: true }}
                          required
                          type="number"
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
        </Formik>
      </Modal>
    );
  }

  return false;
}

// Setting default value for the props of EditDataUnitItem
EditDataUnitItem.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the EditDataUnitItem
EditDataUnitItem.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default EditDataUnitItem;