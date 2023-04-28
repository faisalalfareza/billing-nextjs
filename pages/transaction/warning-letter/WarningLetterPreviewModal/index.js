import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import MDBox from "/components/MDBox";
import { Modal, ModalHeader, ModalBody, ModalFooter, CardBody, CardText, CardLink, Card, Table } from "reactstrap";
import MDButton from "/components/MDButton";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers/alert.service";

function WarningLetterPreviewModal({ isOpen, params, onModalChanged }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken }] = useCookies();

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged) => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(isChanged), 0);
  };


  const externalCloseBtn = (
    <button
      type="button"
      className="close"
      style={{ position: 'absolute', top: '115px', right: '135px' }}
      onClick={() => closeModal()}
    >
      &times;
    </button>
  );

if(isOpen){

  const {location} = params
  const {spDate} = params
  const {refNo} = params
  const {peringatanNo} = params
  const {jatuhtempoDate} = params
  const {custName} = params
  const {alamatKorespondensi} = params
  const {unitCode} = params
  const {unitNo} = params
  const {totalPembayaran} = params
  const {bank} = params
  const {vaNo} = params
  const {officePhone} = params
  const {siteEmail} = params
  const {siteName} = params
  const {siteAddress} = params
  const {invoiceNo} = params


  //console.log('---is open---', isOpen, ' datanya ->', params);
  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      toggle={toggleModal}
      onOpened={openModal}
      onClosed={closeModal}
      external={externalCloseBtn}
      >
        <ModalBody>
          <MDBox display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <CardBody>
              <CardText>
                {location}, {spDate}
                <br />
                Ref. No : {refNo}
                <br />
                Perihal : Surat Peringatan " {peringatanNo} " Batas jatuh tempo Pembayaran Billing
              </CardText>
              <CardText>
                Pelanggan yang Terhormat,
              </CardText>
              <CardText>
                Sebelumnya kami mengucapkan terima kasih atas kepercayaan Bapak/Ibu yang telah melakukan pembayaran billing.
              </CardText>
              <CardText>
                Surat ini merupakan <b>"Surat Peringatan {peringatanNo}"</b> yang di kirim secara otomatis melalu sistem sehubungan dengan
                belum diterimanya pembayaran billing bulan <b>{jatuhtempoDate}</b> yang saat ini sudah jatuh tempo.
              </CardText>
              <CardText>
                Untuk menghindari denda atas keterlambatan pembayaran tersebut , kami mohon kepada Bapak/ Ibu untuk segera 
                melakukan pembayaran billing selambat lambatnya 7 (Tujuh) hari setelah tanggal surat ini.
              </CardText>
              <CardText>
                Berikut kami sampaikan jumlah tagihan dan rekening pembayaran milik Bapak/Ibu:
              </CardText>
              <CardText>
                Nama : {custName}
                <br />
                Alamat Korespondensi : {alamatKorespondensi}
                <br />
                Unit : {unitCode} {unitNo}
              </CardText>
              <Card>
                <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Nomor Invoice</th>
                    <th>Deskripsi</th>
                    <th>Total Tagihan</th>
                    <th>Bank</th>
                    <th>Nomor Virtual Account</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{refNo}</td>
                    <td>descriptions</td>
                    <td>{totalPembayaran}</td>
                    <td>{bank}</td>
                    <td>{vaNo}</td>
                  </tr>
                </tbody>
                </Table>
              </Card>
              <CardText>
                Mohon abaikan surat ini apabila Bapak/Ibu telah melakukan pembayaran dengan mengirimkan bukti pembayaran melalui 
                email ke <CardLink href={"mailto:"+siteEmail}>{siteEmail}</CardLink>
              </CardText>
              <CardText>
                Untuk keterangan lebih lanjut, Bapak/Ibu dapat menghubungi kami melalui nomor telpon : <CardLink href={"tel:+"+officePhone}>{officePhone}</CardLink> atau email :<CardLink href={"mailto:"+siteEmail}>{siteEmail} </CardLink>
                atau dapat mengunjungi TMD GMTD {siteAddress} 
              </CardText>
              <CardText>
                Atas perhatian dan kerjasama Bapak/Ibu, Kami mengucapkan terima kasih.
              </CardText>
              <CardText>
                Hormat Kami, <br />
                {siteName}
              </CardText>
              <CardText>
                *Surat ini di cetak dan dikirimkan secara eletronik, sehingga berlaku dan sah tanpa tanda tangan dari pihak berwenang 
                mewakili {siteName}.
              </CardText>
            </CardBody>
          </MDBox>
        </ModalBody>
        <ModalFooter>
          <MDBox display="flex" alignItems="right">
            <MDButton
              style={{ color: "#4593C4", cursor: "pointer", }}
              onClick={() => closeModal()}
            >
              Close
            </MDButton>
          </MDBox>
        </ModalFooter>
        
    </Modal>
    );
}else{
  return false;
}
}

// Setting default value for the props of DetailCancelPayment
WarningLetterPreviewModal.defaultProps = {
  isOpen: false,
  params: undefined,
};

const rawHTML = `
<div>
  <h1>The Second Example</h1>
  <p>The <strong>rat</strong> hates the <strong>cat</strong></p>
  <p><i>This is something special</i></p>
  <hr/>  
  <div>
    <img src="https://www.kindacode.com/wp-content/uploads/2021/06/pi-2.jpeg" width="500"/>
  </div>
  <hr/>  
  <h4>Just Another Heading</h4>
</div>
`;

export default WarningLetterPreviewModal;