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

export default function DetailTemplate(props) {
  const { isOpen, params, close } = props;
  const [modal, setModal] = useState(isOpen);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  useEffect(() => {}, [params]);
  const toggle = () => setModal(!modal);

  const closeBtn = (
    <IconButton onClick={close} aria-label="close">
      <CloseIcon />
    </IconButton>
  );

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
          <MDTypography variant="h5">View Detail Template</MDTypography>
        </MDBox>
      </ModalHeader>
      <ModalBody>
        {params}
        <iframe src={params} />
      </ModalBody>
      <ModalFooter>
        <MDButton variant="outlined" color="secondary" onClick={close}>
          Cancel
        </MDButton>
      </ModalFooter>
    </Modal>
  );
}
