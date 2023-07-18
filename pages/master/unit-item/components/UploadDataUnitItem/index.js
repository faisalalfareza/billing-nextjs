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

// Data
import { typeNormalization, getExtension } from "/helpers/utils";
import { alertService } from "/helpers";
import { useCookies } from "react-cookie";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import DetailTemplate from "../detail-template";

function UploadDataUnitItem(props) {
  const { isOpen, onModalChanged, site } = props;
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  let [first, setFirst] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [dataTemplateInvoice, setDataTemplateInvoice] = useState([]);
  const [dataUnitItem, setDataUnitItem] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [cols, setCols] = useState([]);
  const SheetJSFT = ["xlsx", "xlsb", "xlsm", "xls", "xml", "csv"]
    .map(function (x) {
      return "." + x;
    })
    .join(",");

  const handleDetail = () => {
    setOpenDetail(!openDetail);
  };

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
    element.href = "/template/template-upload-unit-item.xlsx";
    element.download = "template-upload-unit-item.xlsx";
    element.click();
  };

  const schemeModels = {
    formId: "unit-item-upload-form",
    formField: {
      templateInvoice: {
        name: "templateInvoice",
        label: "Template Invoice",
        placeholder: "Choose Template Invoice",
        type: "text",
        isRequired: true,
        errorMsg: "Template Invoice is required.",
        defaultValue: "",
      },
      fileUpload: {
        name: "fileUpload",
        label: "File Upload",
        placeholder: "Choose File",
        type: "file",
        isRequired: true,
        errorMsg: "*Only file .xls / .xlsx and maximum size 5mb",
        defaultValue: "",
      },
    },
  };
  let { templateInvoice, fileUpload } = schemeModels.formField;

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    [templateInvoice.name]: null,
    [fileUpload.name]: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const templateInvoiceBlockLoadingName = "block-template-invoice";
  const getTemplateInvoice = async (val) => {
    Block.dots(`.${templateInvoiceBlockLoadingName}`);

    let response = await fetch(
      "/api/master/unititem/getdropdownmastertemplate",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: { SiteID: site?.siteId },
        }),
      }
    );
    if (!response.ok) throw new Error(`{Error}: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataTemplateInvoice(response.result);

    Block.remove(`.${templateInvoiceBlockLoadingName}`);
  };

  useEffect(() => {
    if (!first) {
      getTemplateInvoice();
    }
    setFirst(true), first = true;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const uploadExcelUnitItemBlockLoadingName = "block-upload-excel-unit-item";
  const uploadExcel = async (values, actions) => {
    Block.standard(
      `.${uploadExcelUnitItemBlockLoadingName}`,
      `Uploading Unit Item`
    ),
      setLoading(true);

    const list = [];
    dataUnitItem.map((e) => {
      list.push({
        unitNo: e.UnitNo,
        unitCode: e.UnitCode,
        bank: e.Bank,
        vaNo: +e["Virtual Account Number"],
        penalty: e.Penalty == "Yes" ? true : false,
      });
    });
    const body = {
      siteId: site.siteId,
      templateInvoiceId: formValues.templateInvoice?.templateInvoiceHeaderId,
      detailUploadUnitItemList: list,
    };

    let response = await fetch("/api/master/unititem/uploadexcelnewunititem", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      alertService.error({
        text: response.error.error.message,
        title: "Error",
      });
      setLoading(false);
    } else {
      const isFailed = response.result.totalGagal > 0;
      let title = "",
        icon = "";
      if (isFailed) {
        title = "Upload Water Reading Failed";
        icon = "error";
      } else {
        title = "Upload Water Reading Successfull";
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
        setDataUnitItem([]);

        closeModal(true);
      });
    }

    Block.remove(`.${uploadExcelUnitItemBlockLoadingName}`), setLoading(false);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => setDataUnitItem([]), 1500);
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [templateInvoice.name]: templateInvoice.isRequired
        ? Yup.object()
            .required(templateInvoice.errorMsg)
            .typeError(templateInvoice.errorMsg)
        : Yup.object().notRequired(),
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
    const handleFile = (file, isPassed, message) => {
      /* Boilerplate to set up FileReader */
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;
      reader.onload = (e) => {
        /* Parse data */
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
        if (parseInt(wb.Strings.Count) > 5) {
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data = XLSX.utils.sheet_to_json(ws, { header: 2 });
          /* Update state */

          setCols(make_cols(ws["!ref"]));
          // this.setState({ data: data, cols: make_cols(ws["!ref"]) });
          for (const e of data) {
            const valueOfKeys = [
              e["UnitCode"],
              e["UnitNo"],
              e["Bank"],
              e["Virtual Account Number"],
              e["Penalty"],
            ];

            // Validation Step 3: Cell empty
            if (valueOfKeys.indexOf(undefined) != -1) {
              message.failed += "some cells are still empty or not filled";
              Notify.failure(message.failed),
                Block.remove(`.${uploadedListBlockLoadingName}`);

              return false;
            }
          }
          setDataUnitItem(data);
          Block.remove(`.${uploadedListBlockLoadingName}`);
          if (dataUnitItem.length > 0)
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
    const uploadaOptions = {
      fileType: SheetJSFT,
      maxFileSize: 5000000,
    };
    const handleChangeFile = (e) => {
      const files = e.target.files;
      if (files && files[0]) {
        let file = files[0];
        let isPassed = [true, true],
          message = {
            failed: "Upload failed, ",
            success: "Upload Unit Item Successfully",
          };

        Block.dots(`.${uploadedListBlockLoadingName}`);

        // Validation Step 1: File size & type
        if (uploadaOptions.fileType.indexOf(getExtension(file.name)) == -1) {
          message.failed +=
            "only files with " +
            uploadaOptions.fileType +
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
        size="xl"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
        className={uploadExcelUnitItemBlockLoadingName}
      >
        <MDBox py={3} px={6} lineHeight={1}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={6}>
              <MDTypography variant="h5">Upload New Unit Item</MDTypography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
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
              checkingSuccessInput(
                values.templateInvoice,
                errors.templateInvoice
              ) && checkingSuccessInput(values.fileUpload, errors.fileUpload);

            return (
              <Form id={schemeModels.formId} autoComplete="off">
                <ModalBody>
                  <MDBox pb={3} px={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={12}>
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
                        {dataUnitItem.length > 0 && (
                          <MDTypography variant="body">
                            Uploaded {dataUnitItem.length} rows
                          </MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Field
                          name={templateInvoice.name}
                          key={templateInvoice.name}
                          component={Autocomplete}
                          isOptionEqualToValue={(option, value) =>
                            option.templateInvoiceHeaderId ===
                            value.templateInvoiceHeaderId
                          }
                          options={dataTemplateInvoice}
                          getOptionLabel={(option) => option.templateName}
                          onChange={(e, value) => {
                            setFieldValue(
                              templateInvoice.name,
                              value !== null
                                ? value
                                : initialValues[templateInvoice.name]
                            );
                          }}
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              type={templateInvoice.type}
                              required={templateInvoice.isRequired}
                              label={templateInvoice.label}
                              name={templateInvoice.name}
                              placeholder={templateInvoice.placeholder}
                              InputLabelProps={{ shrink: true }}
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
                        <DetailTemplate
                          isOpen={openDetail}
                          params={formValues.templateInvoice?.urltemplate}
                          templateName={
                            formValues.templateInvoice?.templateName
                          }
                          close={handleDetail}
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

// Setting default value for the props of UploadDataUnitItem
UploadDataUnitItem.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the UploadDataUnitItem
UploadDataUnitItem.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default UploadDataUnitItem;
