import React, { useState, useEffect } from "react";
import * as dayjs from "dayjs";
import Swal from "sweetalert2";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import * as XLSX from "xlsx";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import { Grid, Icon } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import FormField from "/pagesComponents/FormField";
import { Block } from "notiflix/build/notiflix-block-aio";
import { Notify } from "notiflix/build/notiflix-notify-aio";

// Data
import { typeNormalization, getExtension } from "/helpers/utils";
import { alertService } from "/helpers";
import { useCookies } from "react-cookie";
function UploadAdjustment(props) {
  const { isOpen, onModalChanged, site, period } = props;
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoading, setLoading] = useState(false);
  const [dataAdj, setDataAdj] = useState([]);
  const [cols, setCols] = useState([]);

  const uploadaOptions = {
    fileType: ["xlsx", "xlsb", "xlsm", "xls", "xml", "csv"],
    maxFileSize: 1000000 * 2,
  };
  const SheetJSFT = uploadaOptions.fileType
    .map(function (x) {
      return "." + x;
    })
    .join(",");

  /* generate an array of column objects */
  const make_cols = (refstr) => {
    let o = [],
      C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i)
      o[i] = { name: XLSX.utils.encode_col(i), key: i };
    return o;
  };
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    element.href = "/template/template-upload-bulk-adjustment.xlsx";
    element.download = "template-upload-bulk-adjustment.xlsx";
    element.click();
  };

  const schemeModels = {
    formId: "water-upload-form",
    formField: {
      fileUpload: {
        name: "fileUpload",
        label: "File Upload",
        placeholder: "Choose File",
        type: "file",
        isRequired: true,
        errorMsg: "File is required.",
        defaultValue: "",
      },
    },
  };
  let { fileUpload } = schemeModels.formField;

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    [fileUpload.name]: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  useEffect(() => {
    if (site) {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const uploadExcelInvoiceBlockLoadingName = "block-upload-excel-invoice";
  const uploadExcel = async (values, actions) => {
    Block.standard(
      `.${uploadExcelInvoiceBlockLoadingName}`,
      `Uploading Adjustment`
    ),
      setLoading(true);
    console.log(dataAdj);
    const body = {
      siteId: site?.siteId,
      periodId: period?.periodId,
      adjInvoiceUploadDetailList: dataAdj,
    };

    let response = await fetch(
      "/api/transaction/invoice/uploadexcelchangeadjinvoice",
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

    if (response.error)
      alertService.error({
        text: response.error.error.message,
        title: "Error",
      });
    else {
      const isFailed = response.result.totalGagal > 0;
      let title = "",
        icon = "";
      if (isFailed) {
        title = "Upload Adjustment Failed";
        icon = "error";
      } else {
        title = "Upload Adjustment Successfull";
        icon = "success";
      }
      Swal.fire({
        title: title,
        html:
          `${response.result.totalSukses} data has been successfully uploaded.` +
          (isFailed
            ? `<br><strong>${response.result.totalGagal} data failed to upload</strong>, <a href="${response.result.urlDataGagal}" download="error-upload-bulk-payment.xlsx"><u>download here to see.</u></a>`
            : ``),
        icon: icon,
        timerProgressBar: true,
        timer: !isFailed && 3000,
      }).then(() => {
        if (isFailed) {
          actions.setFieldValue(fileUpload.name, null);
          setTimeout(
            () => (document.getElementsByName(fileUpload.name)[0].value = null),
            0
          );
        } else {
          actions.resetForm();
          setTimeout(() => {
            document.getElementsByName(fileUpload.name)[0].value = null;
          }, 0);
        }
        setDataAdj([]);

        if (!isFailed) closeModal(true);
      });
    }

    Block.remove(`.${uploadExcelInvoiceBlockLoadingName}`), setLoading(false);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => setDataAdj([]), 1500);
    setTimeout(() => onModalChanged(true), 0);
  };

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [fileUpload.name]: fileUpload.isRequired
        ? Yup.mixed().required(fileUpload.errorMsg)
        : Yup.mixed().notRequired(),
    });

    const checkingSuccessInput = (value, error) => {
      return value != undefined && value != "" && value != null && !error;
    };
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const submitForm = async (values, actions) => {
      // await sleep(1000);
      uploadExcel(values, actions);
    };

    const uploadedListBlockLoadingName = "block-uploaded-list";
    const handleFile = (file, isPassed, message /*:File*/) => {
      /* Boilerplate to set up FileReader */
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;
      reader.onload = (e) => {
        /* Parse data */
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
        if (parseInt(wb.Strings.Count) > 4) {
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data = XLSX.utils.sheet_to_json(ws, { header: 2 });
          /* Update state */

          let data_formated = [];
          for (const e of data) {
            const valueOfKeys = [
              e["Adjustment Nominal"],
              e["Invoice No"],
              e["UnitCode"],
              e["UnitNo"],
            ];

            // Validation Step 3: Cell empty
            if (valueOfKeys.indexOf(undefined) != -1) {
              message.failed += "some cells are still empty or not filled";
              Notify.failure(message.failed),
                Block.remove(`.${uploadedListBlockLoadingName}`);
              data_formated = [];
              setDataAdj([]);
              break;
            } else {
              data_formated.push({
                adjNominal: valueOfKeys[0],
                invoiceNo: valueOfKeys[1],
                unitCode: valueOfKeys[2],
                unitNo: valueOfKeys[3],
              });
            }
          }
          setDataAdj(data_formated), (dataAdj = data_formated);
          if (data_formated.length > 0 && dataAdj.length > 0)
            Notify.success(message.success),
              Block.remove(`.${uploadedListBlockLoadingName}`);
        } else {
          message.failed += "file is still empty or not filled";
          Notify.failure(message.failed),
            Block.remove(`.${uploadedListBlockLoadingName}`);
        }
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
    };
    const handleChangeFile = (e) => {
      const files = e.target.files;
      if (files && files[0]) {
        let file = files[0];
        let isPassed = [true, true],
          message = {
            failed: "Upload failed, ",
            success: "Upload Adjustment Successfully",
          };

        Block.dots(`.${uploadedListBlockLoadingName}`);

        // Validation Step 1: File size & type
        if (uploadaOptions.fileType.indexOf(getExtension(file.name)) == -1) {
          message.failed +=
            "only files with " +
            uploadaOptions.fileType.join("|").toString() +
            " formats are accepted";
          isPassed[0] = false;
        }
        if (file.size > uploadaOptions.maxFileSize) {
          !isPassed[0] ? (message.failed += " & ") : (message.failed += "");
          message.failed += "file size exceeds the recommended maximum";
          isPassed[0] = true;
        }

        if (!isPassed[0])
          Notify.failure(message.failed),
            Block.remove(`.${uploadedListBlockLoadingName}`);
        else handleFile(file, isPassed, message);
      }
    };

    return (
      <Modal
        {...props}
        size="lg"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
        className={uploadExcelInvoiceBlockLoadingName}
      >
        <Formik
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

            const isValifForm = () =>
              checkingSuccessInput(values.fileUpload, errors.fileUpload);

            return (
              <Form id={schemeModels.formId} autoComplete="off">
                <ModalHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                      <MDBox mb={1}>
                        <MDTypography variant="h5">
                          Upload Adjustment
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </ModalHeader>
                <ModalBody>
                  <MDBox pb={3} px={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <FormField
                          type={fileUpload.type}
                          required={fileUpload.isRequired}
                          label={fileUpload.label}
                          name={fileUpload.name}
                          placeholder={fileUpload.placeholder}
                          InputLabelProps={{ shrink: true }}
                          error={errors.fileUpload && touched.fileUpload}
                          success={checkingSuccessInput(
                            formValues.fileUpload,
                            errors.fileUpload
                          )}
                          // setFieldValue={setFieldValue}
                          accept={SheetJSFT}
                          onChange={(e, value) => {
                            handleChangeFile(e);
                            setFieldValue(fileUpload.name, e.target.value);
                          }}
                          className={uploadedListBlockLoadingName}
                        />
                        {dataAdj.length > 0 && (
                          <MDTypography variant="body">
                            Uploaded {dataAdj.length} rows
                          </MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <MDButton
                          variant="outlined"
                          color="primary"
                          onClick={downloadTxtFile}
                        >
                          <Icon>article</Icon>&nbsp; Download Template
                        </MDButton>
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

// Setting default value for the props of UploadAdjustment
UploadAdjustment.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the UploadAdjustment
UploadAdjustment.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default UploadAdjustment;
