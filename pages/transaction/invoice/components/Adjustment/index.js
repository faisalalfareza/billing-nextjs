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
import NumberInput from "/pagesComponents/dropdown/NumberInput";
import { Block } from "notiflix/build/notiflix-block-aio";

export default function Adjustment(props) {
  const { isOpen, params, close } = props;
  const [modal, setModal] = useState(isOpen);
  const [isLoading, setLoading] = useState(false);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const adjustInvoiceBlockLoadingName = "block-adjust-invoice";
  const adjustData = async (values, actions) => {
    Block.standard(
      `.${adjustInvoiceBlockLoadingName}`,
      `Adjusting & Regenerating Invoice`
    ),
      setLoading(true);

    let response = await fetch(
      "/api/transaction/invoice/changeadjustmentinvoice",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            InvoiceHeaderId: params.invoiceHeaderId,
            adjNominal: values.adjustmentNominal,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.info({
        title: response.error.error.message,
      });
    else {
      alertService.success({
        title: "Adjustment Succesfull",
        text: "The adjustment for this invoice has been successfully saved",
      });
      close();
    }

    Block.remove(`.${adjustInvoiceBlockLoadingName}`), setLoading(false);
  };
  const toggle = () => setModal(!modal);

  const closeBtn = (
    <IconButton onClick={close} aria-label="close">
      <CloseIcon />
    </IconButton>
  );

  const initialValues = {
    adjustmentNominal: params?.totalTunggakan,
    unitCode: params?.unitCode,
    unitNo: params?.unitNo,
    invoiceNo: params?.invoiceNo,
  };
  let schemeValidations = Yup.object().shape({
    adjustmentNominal: Yup.string()
      .required("Adjustment Nominal is required.")
      .typeError("Adjustment Nominal is required."),
    unitCode: Yup.string(),
    unitNo: Yup.string(),
    invoiceNo: Yup.string(),
  });

  const submitForm = async (values, actions) => {
    adjustData(values, actions);
  };

  const [formValues, setformValues] = useState(initialValues);
  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      {...props}
      backdrop="false"
      keyboard="true"
      size="xl"
      className={adjustInvoiceBlockLoadingName}
    >
      <ModalHeader toggle={toggle} close={closeBtn}>
        <MDBox mb={1}>
          <MDTypography variant="h5">Adjustment</MDTypography>
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
                    values.adjustmentNominal,
                    errors.adjustmentNominal
                  );
                };
                return (
                  <Form id="adjustment-form" autoComplete="off" fullWidth>
                    <MDBox pb={3}>
                      <Grid container spacing={3}>
                        <Grid item xs={4}>
                          <FormField
                            type="text"
                            disabled
                            label="Unit Code "
                            name="unitCode"
                            placeholder="Type PSCode"
                            error={errors.unitCode && touched.unitCode}
                            success={checkingSuccessInput(
                              formValues.unitCode,
                              errors.unitCode
                            )}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <FormField
                            type="text"
                            disabled
                            label="Unit No "
                            name="unitNo"
                            placeholder="Type Unit No"
                            error={errors.unitNo && touched.unitNo}
                            success={checkingSuccessInput(
                              formValues.unitNo,
                              errors.unitNo
                            )}
                          />
                        </Grid>

                        <Grid item xs={4}>
                          <FormField
                            type="text"
                            disabled
                            label="Invoice Number "
                            name="invoiceNo"
                            placeholder="Type Invoice Number"
                            error={errors.invoiceNo && touched.invoiceNo}
                            success={checkingSuccessInput(
                              formValues.invoiceNo,
                              errors.invoiceNo
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <NumberInput
                            label="Adjustment Nominal"
                            placeholder="Type Adjustment Nominal"
                            value={formValues.adjustmentNominal}
                            onValueChange={(val) => {
                              setFieldValue(
                                "adjustmentNominal",
                                val.floatValue
                              );
                            }}
                            error={
                              errors.adjustmentNominal &&
                              touched.adjustmentNominal
                            }
                            success={checkingSuccessInput(
                              formValues.adjustmentNominal,
                              errors.adjustmentNominal
                            )}
                          />

                          <MDBox mt={0.75}>
                            <MDTypography
                              component="div"
                              variant="caption"
                              color="error"
                              fontWeight="regular"
                            >
                              <ErrorMessage name="adjustmentNominal" />
                            </MDTypography>
                          </MDBox>
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
                                      !formValues.adjustmentNominal || isLoading
                                    }
                                  >
                                    {isLoading
                                      ? "Saving.."
                                      : "SAVE & REGENERATE INVOICE"}
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
