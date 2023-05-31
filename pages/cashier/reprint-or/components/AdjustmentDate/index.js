import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import DataTable from "/layout/Tables/DataTable";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import * as Yup from "yup";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Radio, Grid } from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import FormField from "/pagesComponents/FormField";
import * as dayjs from "dayjs";
import { Block } from "notiflix/build/notiflix-block-aio";

export default function AdjustmentDate(props) {
  const { isOpen, params, close } = props;
  const [modal, setModal] = useState(isOpen);
  const [isLoading, setLoading] = useState(false);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const adjustReprintoRBlockLoadingName = "block-adjust-transaction-date";
  const addDate = (val) => {
    return dayjs(val).add(1, "day");
  };
  const adjustData = async (values, actions) => {
    Block.standard(
      `.${adjustReprintoRBlockLoadingName}`,
      `Adjusting Transaction Date`
    ),
      setLoading(true);

    let response = await fetch(
      "/api/cashier/reprintor/prosesupdatetransactiondateor",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            BillingHeaderId: params.billingHeaderId,
            newTransactionDate: values.transactionDate,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      alertService.success({
        title: "Adjustment Succesfull",
        text: "The adjustment for this official receipt has been successfully saved",
      });
      close();
    }

    Block.remove(`.${adjustReprintoRBlockLoadingName}`), setLoading(false);
  };
  const toggle = () => setModal(!modal);

  const closeBtn = (
    <IconButton onClick={close} aria-label="close">
      <CloseIcon />
    </IconButton>
  );

  const initialValues = {
    transactionDate: params
      ? dayjs(params.transactionDate).format("YYYY-MM-DD")
      : null,
  };
  let schemeValidations = Yup.object().shape({
    transactionDate: Yup.date()
      .required("Transaction Date is required.")
      .typeError("Transaction Date is required."),
  });

  const submitForm = async (values, actions) => {
    adjustData(values, actions);
  };

  const [formValues, setformValues] = useState(initialValues);
  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };
  const onKeyDown = (e) => {
    e.preventDefault();
  };

  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      {...props}
      backdrop="false"
      keyboard="true"
      size="xl"
      className={adjustReprintoRBlockLoadingName}
    >
      <ModalHeader toggle={toggle} close={closeBtn}>
        <MDBox mb={1}>
          <MDTypography variant="h5">Adjustment Transaction Date</MDTypography>
        </MDBox>
      </ModalHeader>
      <ModalBody>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Formik
              initialValues={initialValues}
              validationSchema={schemeValidations}
              onSubmit={submitForm}
            >
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
                  return checkingSuccessInput(
                    values.transactionDate,
                    errors.transactionDate
                  );
                };
                return (
                  <Form id="adjustment-form" autoComplete="off" fullWidth>
                    <MDBox pb={3}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={12}>
                          <FormField
                            type="date"
                            label="Transaction Date"
                            name="transactionDate"
                            required
                            onKeyDown={onKeyDown}
                            placeholder="Transaction Date"
                            error={
                              errors.transactionDate && touched.transactionDate
                            }
                            success={checkingSuccessInput(
                              formValues.transactionDate,
                              errors.transactionDate
                            )}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} md={12} sx={{ textAlign: "right" }}>
                          <Grid container alignItems="right" spacing={1}>
                            <Grid item xs={12} md={12}>
                              <MDBox
                                display="flex"
                                flexDirection={{ xs: "column", sm: "row" }}
                                justifyContent="flex-end"
                              >
                                <MDButton
                                  type="button"
                                  variant="outlined"
                                  color="secondary"
                                  onClick={close}
                                >
                                  Cancel
                                </MDButton>
                                <MDBox
                                  ml={{ xs: 0, sm: 1 }}
                                  mt={{ xs: 1, sm: 0 }}
                                >
                                  <MDButton
                                    type="submit"
                                    variant="gradient"
                                    color="primary"
                                    sx={{ height: "100%" }}
                                    disabled={
                                      !formValues.transactionDate || isLoading
                                    }
                                  >
                                    {isLoading ? "Saving.." : "SAVE"}
                                  </MDButton>
                                </MDBox>
                              </MDBox>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Form>
                );
              }}
            </Formik>
          </Grid>
        </Grid>
      </ModalBody>
    </Modal>
  );
}
