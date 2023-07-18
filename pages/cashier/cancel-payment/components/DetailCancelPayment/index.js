import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { NumericFormat } from "react-number-format";
import PropTypes from "prop-types";

import { Grid, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { Block } from "notiflix/build/notiflix-block-aio";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDBadge from "/components/MDBadge";

import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers/alert.service";

import FormField from "/pagesComponents/FormField";
import DataTable from "/layout/Tables/DataTable";

function DetailCancelPayment({ isOpen, params, onModalChanged }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken }] = useCookies();
  let [first, setFirst] = useState(false);
  const [listDetail, setListDetail] = useState([]);

  const isCanceled = params?.canceled == "Yes";
  
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
      },
    },
  };
  let { remarks } = schemeModels.formField;
  const schemeValidations = Yup.object().shape({
    [remarks.name]: remarks.isRequired
      ? Yup.string().required(remarks.errorMsg)
      : Yup.string().notRequired().nullable(),
  });
  const schemeInitialValues = {
    [remarks.name]: remarks.defaultValue,
  };

  const detailPaymentBlockLoadingName = "block-detail-payment";
  const [isLoadingDetailCancelPayment, setLoadingDetailCancelPayment] =
    useState(false);
  const [detailCancelPayment, setDetailCancelPayment] = useState();
  const getDetailCancelPayment = async () => {
    Block.standard(`.${detailPaymentBlockLoadingName}`, `Getting ${isCanceled ? 'Canceled Payment' : 'Payment'} Detail`), 
      setLoadingDetailCancelPayment(true);

    const { billingHeaderId } = params;
    let response = await fetch(
      "/api/cashier/cancel-payment/getdetailcancelpayment",
      {
        method: "POST",
        body: JSON.stringify({
          params: {
            BillingHeaderId: billingHeaderId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else {
      setDetailCancelPayment(response);
      const list = [];
      const row = response.listInvoiceDetailCancelPayment.map((e, i) => {
        list.push({
          no: i + 1,
          amount: e.amount,
          invoiceNo: e.invoiceNo,
        });
      });
      setListDetail(list);
    }

    Block.remove(`.${detailPaymentBlockLoadingName}`), 
      setLoadingDetailCancelPayment(false);
  };
  useEffect(() => {
    !first && getDetailCancelPayment();
    setFirst(true), first = true;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const checkingSuccessInput = (isRequired, value, error) => {
    return (
      (!isRequired && true) ||
      (isRequired && value != undefined && value != "" && !error)
    );
  };
  const handleCancelPaymentSubmit = (values, actions) =>
    cancelPayment(values, actions);

  const [isLoadingCancelPayment, setLoadingCancelPayment] = useState(false);
  const cancelPayment = async (values, actions) => {
    const { billingHeaderId, receiptNumber } = detailCancelPayment;

    Swal.fire({
      title: "Are you sure?",
      text: "You will cancel the payment on this receipt number.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No",
      reverseButtons: true,
      focusConfirm: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        Block.standard(`.${detailPaymentBlockLoadingName}`, `Canceling Payment`),
          setLoadingCancelPayment(true);

        let response = await fetch(
          "/api/cashier/cancel-payment/cancelpayment",
          {
            method: "POST",
            body: JSON.stringify({
              accessToken: accessToken,
              params: {
                BillingHeaderId: billingHeaderId,
                Remarks: values.remarks,
              },
            }),
          }
        );
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        response = typeNormalization(await response.json());

        if (response.error) alertService.error({ title: "Error", text: response.error.message });
        else {
          response &&
            Swal.fire({
              title: "Payment Canceled",
              text: `Payment of this receipt number${
                receiptNumber ? ` ${receiptNumber} ` : ` `
              }has been canceled.`,
              icon: "success",
              showConfirmButton: true,
              timerProgressBar: true,
              timer: 3000,
            }).then(() => {
              actions.resetForm();
              closeModal(true);
            });
        }

        Block.remove(`.${detailPaymentBlockLoadingName}`), 
          setLoadingCancelPayment(false);
      }
    });
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => setDetailCancelPayment({}), 1500);
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  const setDetailList = () => {
    return {
      columns: [
        { Header: "No", accessor: "no" },
        { Header: "INVOICE NUMBER", accessor: "invoiceNo" },
        {
          Header: "AMOUNT",
          accessor: "amount",
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
      ],
      rows: listDetail,
    };
  };


  if (isOpen) {
    return (
      detailCancelPayment && (
        <Modal
          size="xl"
          isOpen={isOpen}
          toggle={toggleModal}
          onOpened={openModal}
          onClosed={closeModal}
          className={detailPaymentBlockLoadingName}
        >
          <Formik
            initialValues={schemeInitialValues}
            validationSchema={schemeValidations}
            onSubmit={handleCancelPaymentSubmit}
          >
            {({ values, errors, touched }) => {
              let { remarks: remarksV } = values;
              const isValifForm = () =>
                checkingSuccessInput(
                  remarks.isRequired,
                  remarksV,
                  errors.remarks
                );

              return (
                <Form id={schemeModels.formId} autoComplete="off">
                  <ModalHeader>
                    <Grid item xs={12} md={12}>
                      <MDBox>
                        <MDTypography variant="h5">Detail</MDTypography>
                      </MDBox>
                    </Grid>
                  </ModalHeader>
                  <ModalBody style={{ paddingBottom: 0 }}>
                    <Grid item xs={12} sm={12}>
                      <MDBox
                        component="li"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        bgColor="grey-100"
                        borderRadius="lg"
                        pb={2}
                      >
                        <MDBox
                          width="100%"
                          display="flex"
                          flexDirection="column"
                          lineHeight={1}
                        >
                          <MDBox
                            mb={1}
                            py={1.5}
                            style={{ borderBottom: "0.0625rem solid #f0f2f5" }}
                          >
                            <MDTypography
                              variant="button"
                              fontWeight="medium"
                              textTransform="capitalize"
                              ml={2}
                            >
                              Main Information
                            </MDTypography>
                          </MDBox>
                          <Table sx={{ minWidth: 650 }} size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Receipt Number
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="medium"
                                    textTransform="uppercase"
                                  >
                                    {detailCancelPayment.receiptNumber}
                                  </MDTypography>
                                </TableCell>

                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Payment Method
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
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
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Unit Code
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="medium"
                                    textTransform="uppercase"
                                  >
                                    {detailCancelPayment.unitCode}
                                  </MDTypography>
                                </TableCell>

                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Remarks
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="medium"
                                    textTransform="capitalize"
                                  >
                                    {detailCancelPayment.remarks == null
                                      ? "-"
                                      : detailCancelPayment.remarks}
                                  </MDTypography>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Unit No
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="medium"
                                    textTransform="uppercase"
                                  >
                                    {detailCancelPayment.unitNo}
                                  </MDTypography>
                                </TableCell>

                                <TableCell
                                  rowSpan={2}
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Total Amount
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  rowSpan={2}
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDBadge
                                    variant="contained"
                                    color="info"
                                    badgeContent={
                                      <NumericFormat
                                        displayType="text"
                                        value={detailCancelPayment.totalAmount}
                                        decimalSeparator=","
                                        prefix="Rp. "
                                        thousandSeparator="."
                                      />
                                    }
                                    size="lg"
                                    container
                                    sx={{ textTransform: "capitalize" }}
                                  />
                                </TableCell>
                              </TableRow>

                              <TableRow
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                }}
                              >
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    textTransform="capitalize"
                                  >
                                    Transaction Date
                                  </MDTypography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    paddingTop: 0,
                                    paddingBottom: 0.2,
                                    border: 0,
                                  }}
                                >
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
                    <Grid item xs={12} sm={12} mt={5}>
                      <MDBox
                        component="li"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        borderRadius="lg"
                        pb={1}
                      >
                        <MDBox
                          width="100%"
                          display="flex"
                          flexDirection="column"
                          lineHeight={1}
                        >
                          <MDBox>
                            <MDTypography
                              variant="button"
                              fontWeight="medium"
                              textTransform="capitalize"
                              ml={2}
                            >
                              Detail Information
                            </MDTypography>
                            <DataTable
                              table={setDetailList()}
                              entriesPerPage={{
                                defaultValue: listDetail.length,
                              }}
                            />
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    {!isCanceled && (
                      <Grid item xs={12} sm={12} mt={2}>
                        <FormField
                          type={remarks.type}
                          label={
                            remarks.label + (remarks.isRequired ? " ⁽*⁾" : "")
                          }
                          name={remarks.name}
                          value={remarksV}
                          placeholder={remarks.placeholder}
                          InputLabelProps={{ shrink: true }}
                          error={errors.remarks && touched.remarks}
                          success={
                            remarks.isRequired &&
                            checkingSuccessInput(
                              remarks.isRequired,
                              remarksV,
                              errors.remarks
                            )
                          }
                          multiline
                          rows={4}
                          variant="outlined"
                        />
                      </Grid>
                    )}
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
                        {!isCanceled ? "Cancel" : "Close"}
                      </MDButton>
                      {!isCanceled && (
                        <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                          <MDButton
                            type="submit"
                            variant="gradient"
                            color="primary"
                            sx={{ height: "100%" }}
                            disabled={!isValifForm() || isLoadingCancelPayment}
                          >
                            {isLoadingCancelPayment
                              ? "Canceling Payment.."
                              : "Cancel Payment"}
                          </MDButton>
                        </MDBox>
                      )}
                    </MDBox>
                  </ModalFooter>
                </Form>
              );
            }}
          </Formik>
        </Modal>
      )
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
