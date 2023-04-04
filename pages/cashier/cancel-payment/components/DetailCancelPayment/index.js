import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { NumericFormat } from "react-number-format";
import getConfig from "next/config";
import axios from "axios";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import { Grid } from "@mui/material";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDBadge from "/components/MDBadge";

import FormField from "/pagesComponents/FormField";

// Data
import { useCookies } from "react-cookie";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

const { publicRuntimeConfig } = getConfig();

function DetailCancelPayment({ isOpen, params, onModalChanged }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);

  const schemeModels = {
    formId: "cancel-payment-form",
    formField: {
      remarks: {
        name: "remarks",
        label: "Cancel Payment Remarks",
        placeholder: "Type Cancel Payment Remarks",
        type: "text",
        isRequired: false,
        errorMsg: "Cancel Payment is required.",
        defaultValue: "",
      }
    },
  };
  let { remarks } = schemeModels.formField;
  const schemeValidations = Yup.object().shape({
    [remarks.name]: remarks.isRequired
      ? Yup.string().required(remarks.errorMsg)
      : Yup.string().notRequired().nullable()
  });
  const schemeInitialValues = {
    [remarks.name]: remarks.defaultValue,
  };

  const [detailCancelPayment, setDetailCancelPayment] = useState({});
  const getDetailCancelPayment = (e) => {
    if (e) e.preventDefault();

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetDetailCancelPayment`;
    const config = {
      headers: { Authorization: "Bearer " + accessToken },
      params: {
        BillingHeaderId: params
      }
    };
    axios
      .get(url, config)
      .then(res => setDetailCancelPayment(res.data.result));
  };
  useEffect(() => {
    getDetailCancelPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const checkingSuccessInput = (isRequired, value, error) => {
    return (!isRequired && true) || (isRequired && value != undefined && value != "" && value.length > 0 && !error);
  };
  const submitForm = async (values, actions) => cancelPayment(values, actions);

  const [remarksCancel, setRemarksCancel] = useState();;
  const cancelPayment = async (values, actions) => {
    setLoadingSubmit(true);

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/CancelPayment`;
    const body = {
      BillingHeaderId: detailCancelPayment.billingHeaderId,
      Remarks: values.remarks
    };
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
        'Content-Type': 'application/json'
      },
      params: body
    };

    axios
      .post(url, body, config)
      .finally(() => setLoadingSubmit(false))
      .then(res => {
        res.data.success && Swal.fire({
          title: 'Payment Cancelled',
          text: "Payment with "+detailCancelPayment.receiptNumber+" has been successfully canceled.",
          icon: 'success',
          showConfirmButton: true,
          timerProgressBar: true,
          timer: 3000,
        }).then(() => {
          setLoadingSubmit(false);
          actions.resetForm();
          closeModal();
        });
      }).catch((error) => setLoadingSubmit(false));
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false); setDetailCancelPayment({});
    setTimeout(() => onModalChanged(), 0);
  };

  if (isOpen) {
    return (
      detailCancelPayment && <Modal
        size="lg"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
      >
        <Formik
          initialValues={schemeInitialValues}
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
            let { 
              remarks: remarksV
            } = values;
            const isValifForm = () => (
              checkingSuccessInput(remarks.isRequired, remarksV, errors.remarks)
            );

            return (
              <Form id={schemeModels.formId} autoComplete="off">
                <ModalHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                      <MDBox>
                        <MDTypography variant="h5">
                          Detail Payment
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </ModalHeader>
                <ModalBody>
                  <MDBox>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12}>
                        <MDBox
                          component="li"
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          bgColor="grey-100"
                          borderRadius="lg"
                          p={3}
                        >
                          <MDBox
                            width="100%"
                            display="flex"
                            flexDirection="column"
                            lineHeight={1}
                          >
                            <MDBox mb={2}>
                              <MDTypography
                                variant="button"
                                fontWeight="medium"
                                textTransform="capitalize"
                              >
                                Main Information
                              </MDTypography>
                            </MDBox>
                            <Table sx={{ minWidth: 650 }} size="small">
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Receipt Number
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="medium"
                                      textTransform="uppercase"
                                    >
                                      {detailCancelPayment.receiptNumber}
                                    </MDTypography>
                                  </TableCell>

                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Payment Method
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="medium"
                                      textTransform="capitalize"
                                    >
                                      {detailCancelPayment.method}
                                    </MDTypography>
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Unit Code
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="medium"
                                      textTransform="uppercase"
                                    >
                                      {detailCancelPayment.unitCode}
                                    </MDTypography>
                                  </TableCell>

                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Remarks
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="medium"
                                      textTransform="capitalize"
                                    >
                                      {detailCancelPayment.remarks}
                                    </MDTypography>
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Unit No
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="medium"
                                      textTransform="uppercase"
                                    >
                                      {detailCancelPayment.unitNo}
                                    </MDTypography>
                                  </TableCell>

                                  <TableCell rowSpan={2} sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Total Amount
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell rowSpan={2} sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDBadge
                                      variant="contained"
                                      color="info"
                                      badgeContent={<NumericFormat
                                        displayType="text"
                                        value={detailCancelPayment.totalAmount}
                                        decimalSeparator=","
                                        prefix="Rp. "
                                        thousandSeparator="."
                                      />}
                                      size="lg"
                                      container
                                    />
                                  </TableCell>
                                </TableRow>
                                
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      textTransform="capitalize"
                                    >
                                      Transaction Date
                                    </MDTypography>
                                  </TableCell>
                                  <TableCell sx={{ paddingTop: 0, paddingBottom: 0.2, border: 0 }}>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="medium"
                                    >
                                      {detailCancelPayment.transactionDate}
                                    </MDTypography>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </MDBox>
                        </MDBox>
                      </Grid>   
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={remarks.type}
                          label={remarks.label + (remarks.isRequired ? " ⁽*⁾" : "")}
                          name={remarks.name}
                          value={remarksV}
                          placeholder={remarks.placeholder}
                          InputLabelProps={{ shrink: true }}
                          error={errors.remarks && touched.remarks}
                          success={remarks.isRequired && checkingSuccessInput(remarks.isRequired, remarksV, errors.remarks)}
                        />
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
                        disabled={!isValifForm() || isLoadingSubmit}
                      >
                        {isLoadingSubmit ? "Canceling Payment.." : "Cancel Payment"}
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

// Setting default value for the props of DetailCancelPayment
DetailCancelPayment.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the DetailCancelPayment
DetailCancelPayment.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default DetailCancelPayment;
