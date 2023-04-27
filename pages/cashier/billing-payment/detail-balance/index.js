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

export default function DetailBalance(props) {
  const { isOpen, params, close } = props;
  const [modal, setModal] = useState(isOpen);
  const [listDetail, setListDetail] = useState([]);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const setDetailList = () => {
    return {
      columns: [
        { Header: "No", accessor: "no" },
        { Header: "Deskripsi", accessor: "deskripsi" },
        { Header: "Tanggal", accessor: "tanggal" },
        {
          Header: "Jumlah",
          accessor: "jumlah",
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

  useEffect(() => {
    if (params != undefined) fetchData();
  }, [params]);

  const fetchData = async (data) => {
    let response = await fetch("/api/cashier/billing/viewdetailbalance", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          InvoiceHeaderId: params,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    console.log("response----", response);
    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      const list = [];
      const row = response.result.map((e, i) => {
        list.push({
          no: i + 1,
          deskripsi: e.deskripsi,
          tanggal: e.tanggal,
          jumlah: e.jumlah,
        });
      });
      setListDetail(list);
      console.log("list------", list);
    }
  };
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
          <MDTypography variant="h5">View Detail Balance</MDTypography>
        </MDBox>
      </ModalHeader>
      <ModalBody>
        <MDTypography variant="body1">Rincian :</MDTypography>
        <DataTable
          table={setDetailList()}
          entriesPerPage={{ defaultValue: listDetail.length }}
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
