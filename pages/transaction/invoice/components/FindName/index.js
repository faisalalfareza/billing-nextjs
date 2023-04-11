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

export default function FindName(props) {
  const { isOpen, site, period, close, handlePSCode } = props;
  const [modal, setModal] = useState(isOpen);
  const [isLoading, setLoading] = useState(false);
  const [listDetail, setListDetail] = useState([]);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [selectedPSCode, setSelectedPSCode] = useState(undefined);

  const setDetailList = () => {
    return {
      columns: [
        {
          Header: "Select",
          accessor: "e",
          Cell: ({ value }) => {
            return (
              <Radio
                onChange={(e) => {
                  handleCheck(value);
                }}
                value={value}
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
                checked={value.psCode == selectedPSCode?.psCode}
              />
            );
          },
        },
        { Header: "ID Client", accessor: "psCode" },
        { Header: "Name", accessor: "name" },
      ],
      rows: listDetail,
    };
  };

  const handleCheck = (val) => {
    setSelectedPSCode(val);
  };

  useEffect(() => {
    // fetchData();
  }, []);

  const fetchData = async (values, actions) => {
    setLoading(true);
    let response = await fetch("/api/transaction/invoice/findname", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          PsCode: values.psCode,
          CustName: values.name,
          SiteId: site,
          PeriodId: period,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      const list = [];
      const row = response.result.map((e, i) => {
        list.push({
          e,
          psCode: e.psCode,
          name: e.name,
        });
      });
      setListDetail(list);
      setLoading(false);
    }
  };
  const toggle = () => setModal(!modal);

  const closeBtn = (
    <IconButton onClick={close} aria-label="close">
      <CloseIcon />
    </IconButton>
  );

  const initialValues = {
    psCode: "",
    name: "",
  };
  let schemeValidations = Yup.object().shape({
    psCode: Yup.string()
      .required("PSCode is required.")
      .typeError("PSCode is required."),
    name: Yup.string()
      .required("Name is required.")
      .typeError("Name is required."),
  });

  const submitForm = async (values, actions) => {
    fetchData(values, actions);
  };

  const [formValues, setformValues] = useState(initialValues);
  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const reset = () => {
    setListDetail([]);
    setSelectedPSCode(undefined);
    close();
  };

  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      {...props}
      backdrop="false"
      keyboard="true"
      size="xl"
    >
      <ModalHeader toggle={toggle} close={closeBtn}>
        <MDBox mb={1}>
          <MDTypography variant="h5">Find Name</MDTypography>
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
                const isValifForm = () =>
                  checkingSuccessInput(values.psCode, errors.psCode) &&
                  checkingSuccessInput(values.name, errors.name);
                return (
                  <Form id="payment-detail" autoComplete="off" fullWidth>
                    <MDBox pb={3}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <FormField
                            type="text"
                            label="PSCode "
                            name="psCode"
                            placeholder="Type PSCode"
                            error={errors.psCode && touched.psCode}
                            success={checkingSuccessInput(
                              formValues.psCode,
                              errors.psCode
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormField
                            type="text"
                            label="Name "
                            name="name"
                            placeholder="Type Name"
                            error={errors.name && touched.name}
                            success={checkingSuccessInput(
                              formValues.name,
                              errors.name
                            )}
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
                                    disabled={!isValifForm() || isLoading}
                                  >
                                    {isLoading ? "Searching.." : "Search"}
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
        {listDetail.length > 0 && (
          <DataTable
            table={setDetailList()}
            entriesPerPage={{ defaultValue: listDetail.length }}
          />
        )}
      </ModalBody>
      {listDetail.length > 0 && (
        <ModalFooter>
          <MDButton variant="outlined" color="secondary" onClick={reset}>
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color="primary"
            onClick={() => {
              handlePSCode(selectedPSCode);
              reset();
            }}
            disabled={selectedPSCode == undefined}
          >
            SELECT THIS NAME
          </MDButton>
        </ModalFooter>
      )}
    </Modal>
  );
}
