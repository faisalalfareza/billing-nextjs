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
import { NumericFormat } from "react-number-format";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Document, Page, pdfjs } from "react-pdf";
import DOMPurify from "dompurify";

export default function DetailTemplate(props) {
  const { isOpen, params, close, templateName } = props;
  const [modal, setModal] = useState(isOpen);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [htmlData, setHtmlData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = (numPages) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    // fetch(params).then((r) => {
    //   r.text().then((d) => {
    //     setHtmlData(d);
    //     console.log(d);
    //   });
    // });
    if (params) {
      getContent();
    }
  }, [params]);
  const toggle = () => setModal(!modal);

  const closeBtn = (
    <IconButton onClick={close} aria-label="close">
      <CloseIcon />
    </IconButton>
  );

  const getContent = async (data) => {
    let response = await fetch("/api/master/unititem/geturlcontent", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        urlFile: params,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      const result = response.result;
      setHtmlData(result);
    }
  };
  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      {...props}
      backdrop="false"
      keyboard="true"
      size="lg"
    >
      <ModalHeader toggle={toggle} close={closeBtn}>
        <MDBox mb={1}>
          <MDTypography variant="h5">
            View Detail Template `{templateName}`
          </MDTypography>
        </MDBox>
      </ModalHeader>
      <ModalBody>
        <MDBox
          sx={{ overflow: "scroll" }}
          className="template-display"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlData) }}
        />
      </ModalBody>
      <ModalFooter>
        <MDButton variant="outlined" color="secondary" onClick={close}>
          Cancel
        </MDButton>
      </ModalFooter>
    </Modal>
  );
}
