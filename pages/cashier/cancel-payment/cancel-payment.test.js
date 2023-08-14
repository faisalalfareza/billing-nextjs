import React from 'react';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  waitFor,
  waitForElementToBeRemoved,
  findByRole
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// import renderer from 'react-test-renderer';
// import {createRenderer} from 'react-test-renderer/shallow';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        billingHeaderId: 87,
        receiptNumber: '00024/OR/WMG/08/2023',
        unitCode: 'FRCR',
        unitNo: '0011',
        transactionDate: '03 August 2023',
        method: 'Cash',
        totalAmount: 10000,
        remarks: null,
        listInvoiceDetailCancelPayment: [
          {
            invoiceNo: '00030/INV/WMG/08/2023',
            amount: 10000,
          },
        ],
      }),
  }),
);
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock global components
jest.mock('../../../context', () => {
  return {
    ...jest.requireActual('../../../context'),
    useMaterialUIController: jest.fn(() => {
      return {
        miniSidenav: false,
        transparentSidenav: false,
        whiteSidenav: false,
        coloredSidenav: true,
        sidenavColor: 'dark',
        transparentNavbar: true,
        fixedNavbar: false,
        openConfigurator: false,
        direction: 'ltr',
        layout: 'dashboard',
        darkMode: false,
      };
    }),
  };
});
const byPassParameters = () => ({
  __esModule: true,
  default: jest.fn(props => <div {...props} />),
});
jest.mock('../../../components/MDAlert/MDAlertRoot', () => byPassParameters());
jest.mock('../../../components/MDAvatar/MDAvatarRoot', () => byPassParameters());
jest.mock('../../../components/MDBadge/MDBadgeRoot', () => byPassParameters());
jest.mock('../../../components/MDBox/MDBoxRoot', () => byPassParameters());
jest.mock('../../../components/MDButton/MDButtonRoot', () => byPassParameters());
jest.mock('../../../components/MDDropzone/MDDropzoneRoot', () => byPassParameters());
jest.mock('../../../components/MDEditor/MDEditorRoot', () => byPassParameters());
jest.mock('../../../components/MDInput/MDInputRoot', () => byPassParameters());
jest.mock('../../../components/MDPagination/MDPaginationItemRoot', () => byPassParameters());
jest.mock('../../../components/MDProgress/MDProgressRoot', () => byPassParameters());
jest.mock('../../../components/MDSnackbar/MDSnackbarIconRoot', () => byPassParameters());
jest.mock('../../../components/MDSocialButton/MDSocialButtonRoot', () => byPassParameters());
jest.mock('../../../components/MDTypography/MDTypographyRoot', () => byPassParameters());


afterEach(() => {
  /* AFTER EACH
  ————— Blok kode yang diberikan dalam afterEach akan dijalankan setelah setiap pengujian (test case) berjalan.
  ————— Fungsinya adalah untuk membersihkan atau mereset state|sumber daya|lingkungan setelah setiap pengujian selesai. Ini membantu memastikan bahwa setiap pengujian diisolasi dan tidak dipengaruhi oleh perubahan yang terjadi selama pengujian sebelumnya. Cocok untuk membersihkan sumber daya sementara atau state yang dibuat selama pengujian.
  */
  cleanup();
  jest.clearAllMocks();
  jest.resetModules();
});


import DetailCancelPayment from './components/DetailCancelPayment';
const { name } = DetailCancelPayment;
describe(`COMPONENT: ${name.toUpperCase()}`, () => {
  // let originalFetch;

  beforeAll(() => {
    // Simpan implementasi asli fetch sebelum menggantinya
    // originalFetch = global.fetch;
  });
  
  // test('Merender Modal ketika isOpen bernilai true (menggunakan Shallow RTL), lengkap dengan struktur ModalHeader, ModalBody, ModalFooter', async () => {
  //   const shallowRenderer = createRenderer();
  //   shallowRenderer.render(
  //     <DetailCancelPayment isOpen={true} params={{billingHeaderId: 87}} />,
  //   );

  //   await waitFor(() => {
  //     const getModal = shallowRenderer.getRenderOutput();
  //     const getModalChilds = getModal.props.children.props.children;

  //     expect(getModal.props.isOpen).toBeTruthy();
  //     expect(getModal.type.name).toBe('Modal');
  //     expect(getModalChilds[0].type.name).toBe('ModalHeader');
  //     expect(getModalChilds[1].type.name).toBe('ModalBody');
  //     expect(getModalChilds[2].type.name).toBe('ModalFooter');
  //   });
  // });

  // 
  
  /* PENGUJIAN DENGAN PROPERTI YANG BERBEDA [DONE - MORE DETAILS]
  ————— Uji komponen dengan memberikan properti yang berbeda.
  */
  describe('—————PENGUJIAN DENGAN PROPERTI (PROPS/PARAMETER) YANG BERBEDA [DONE]', () => { 
    // MEMILIKI DEFAULT PROPS (NON-MANDATORY)
    test(`Merender modal ${name} ketika properti isOpen bernilai true`, async () => {
      const { queryByRole } = render(<DetailCancelPayment isOpen={true} params={{ billingHeaderId: 87 }} />);
      await waitFor(() => {
        const getModal = queryByRole('dialog');
        expect(getModal).toBeInTheDocument();
        expect(getModal).toHaveClass('modal fade show');
      },
      /* TIMEOUT
      ————— Waktu singkat/pendek: Jika yakin bahwa perubahan tampilan seharusnya terjadi dengan cepat dan komponen yang diuji tidak terlalu kompleks, dapat mulai dengan waktu timeout sekitar 1000 ms (1 detik).
      ————— Waktu sedang: Untuk kasus umum di mana komponen mungkin sedikit lebih kompleks atau mengambil data dari jaringan, timeout sekitar 3000 ms (3 detik).
      ————— Waktu lama/panjang: Jika  merasa perubahan tampilan memerlukan waktu lebih lama atau komponen yang diuji sangat kompleks,  timeout sekitar 5000 ms (5 detik) atau bahkan lebih.
      */
      { timeout: 3000 } // 1000 (waktu singkat/pendek) | 3000 (waktu sedang) | 5000 (waktu lama/panjang)
      );
    });
    test.each([
      [`undefined / tidak mengirim isOpen (menguji defaultProps)`, undefined],
      [`false`, false]
    ])(`Tidak merender modal ${name} ketika properti isOpen bernilai %s`, async (name, isOpen) => {
      const { queryByRole } = render(<DetailCancelPayment isOpen={isOpen} params={{ billingHeaderId: 87 }} />);
      await waitFor(() => {
        const getModal = queryByRole('dialog');
        expect(getModal).not.toBeInTheDocument();
      });
    });
    test.each([
      [`undefined / tidak mengirim canceled (menguji isCanceled)`, { billingHeaderId: 87 }],
      [`"No"`, { billingHeaderId: 87, canceled: 'No' }]
    ])(`Input remarks tampil ketika parameter canceled bernilai %s`, async (name, params) => {
      const { queryByPlaceholderText, queryByText } = render(<DetailCancelPayment isOpen={true} params={params} />);
      await waitFor(() => {
        expect(queryByPlaceholderText('Type Cancel Payment Remarks')).toBeInTheDocument();
        expect(queryByText('Cancel')).toBeInTheDocument();
        expect(queryByText('Close')).not.toBeInTheDocument();
      });
    });
    test(`Input remarks tidak tampil ketika parameter canceled bernilai "Yes"`, async () => {
      const { queryByLabelText, queryByText } = render(<DetailCancelPayment isOpen={true} params={{ billingHeaderId: 87, canceled: "Yes" }} />);
      await waitFor(() => {
        expect(queryByLabelText('Cancel Payment Remarks')).not.toBeInTheDocument();
        expect(queryByText('Cancel')).not.toBeInTheDocument();
        expect(queryByText('Close')).toBeInTheDocument();
      });
    });    

    // TIDAK MEMILIKI DEFAULT PROPS (MANDATORY)
    // test(`Tidak merender modal ${name} ketika parameter billingHeaderId bernilai undefined / tidak mengirim properti params`, async () => {
    //   const { getByRole } = render(<DetailCancelPayment isOpen={true} />);
    //   await waitFor(() => {
    //     expect(getByRole('dialog')).not.toBeInTheDocument();
    //   });
    // });
  });

  /* PENGUJIAN ELEMENT / STRUKTUR KOMPONEN [DONE] */
  describe('—————PENGUJIAN ELEMENT / STRUKTUR KOMPONEN [DONE]', () => { 
    test(`Struktur modal ${name} sudah ¹lengkap (terpasang semua), ²benar (sesuai urutan) dan ³tidak redundan`, async () => {
      const { queryByRole } = render(<DetailCancelPayment isOpen={true} params={{billingHeaderId: 87}} />);
      await waitFor(() => {
        const getModal = queryByRole('dialog');
        expect(getModal.querySelector('.modal-dialog')).toBeInTheDocument();

        const getModalContent = getModal.querySelector('.modal-dialog .modal-content');
        expect(getModalContent).toBeInTheDocument();

        for (const childs of [
          '.modal-header',
          '.modal-body',
          '.modal-footer'
        ]) {
          expect(getModalContent.querySelector(childs)).toBeInTheDocument();
          expect(getModalContent.querySelectorAll(childs).length).toBe(1);
        }
      });
    });
  });

  /* PENGUJIAN INTERAKSI [PENDING]
  ————— Jika komponen memiliki interaksi seperti tombol atau input, dapat menguji perilaku interaksi ini. Contohnya, jika ada tombol yang memicu tutup modal, bisa menguji apakah modal ditutup ketika tombol tersebut diklik.
  */
  describe('—————PENGUJIAN INTERAKSI [IN PROGRESS]', () => { 
    test(`Tutup modal ${name} ketika tombol tutup diklik`, async () => {
      const { getByText, queryByText, queryByRole } = render(<DetailCancelPayment isOpen={true} params={{ billingHeaderId: 87 }} onModalChanged={jest.fn()} />);

      await waitFor(() => expect(getByText('Cancel')).toBeInTheDocument());

      const closeButton = queryByText('Cancel');
      fireEvent.click(closeButton);

      // expect(queryByRole('dialog')).not.toBeInTheDocument();
      // expect(closeButton).not.toBeInTheDocument();
    });
  });
  
  /* PENGUJIAN INTEGRASI 
  ————— Jika komponen Anda bergantung pada konteks atau komponen global, Anda bisa menguji cara komponen berinteraksi dengan konteks atau komponen tersebut.
  ————— Uji cara komponen bekerja dengan komponen lain dalam aplikasi Anda. Mungkin ada dependensi atau interaksi antara komponen yang perlu diuji.
  */

  /* PENGUJIAN RESPONSIF [WAITING]
  ————— Jika komponen  memiliki perilaku yang berubah tergantung pada ukuran layar atau perangkat yang digunakan, dapat menguji responsivitasnya dengan mengubah ukuran layar selama pengujian.
  */
  describe('—————PENGUJIAN RESPONSIF [WAITING]', () => { 
    // test(`Modal ${name} responsif pada layar kecil`, async () => {
    //   // Simulasikan lebar layar kecil
    //   global.innerWidth = 480; // 480 (lebar layar kecil) | 120 (lebar layar besar)

    //   render(<DetailCancelPayment isOpen={true} params={{ billingHeaderId: 87 }} />);

    //   // Tunggu hingga komponen selesai merender
    //   await screen.findByRole('dialog');

    //   // Pastikan bahwa elemen-elemen tertentu hanya muncul pada layar kecil
    //   const mobileOnlyElement = screen.queryByText('Hanya Tampil di Layar Kecil');
    //   expect(mobileOnlyElement).toBeInTheDocument();

    //   // Pastikan bahwa elemen-elemen tertentu hanya muncul pada layar besar
    //   const desktopOnlyElement = screen.queryByText('Hanya Tampil di Layar Besar');
    //   expect(desktopOnlyElement).not.toBeInTheDocument();

    //   // Lakukan pengujian lainnya terkait perilaku komponen pada layar kecil
    // });
  });

    /* PENGUJIAN ERROR HANDLING 
  ————— Uji bagaimana komponen merespons jika pemanggilan API fetch gagal (misalnya, dengan mengubah global.fetch menjadi mengembalikan Promise rejection).
  ————— Uji komponen dengan memberikan properti yang tidak sesuai atau tidak valid.
  */
  // test(`Menangani kesalahan saat panggilan API fetch gagal`, async () => {
  //   // Simulasikan pemanggilan API fetch yang gagal
  //   global.fetch = jest.fn(() => Promise.reject('Failed to fetch data'));

  //   const { queryByText } = render(<DetailCancelPayment isOpen={true} params={{ billingHeaderId: 87 }} />);
  //   await waitFor(() => {
  //     const errorText = queryByText('Failed to fetch data');
  //     expect(errorText).toBeInTheDocument();
  //   });
  // });

  afterAll(() => {
    /* AFTER ALL
    ————— Blok kode dalam afterAll dijalankan setelah semua pengujian dalam sebuah "test suite" (kelompok pengujian) selesai.
    ————— Fungsinya adalah untuk melakukan tindakan bersih-bersih atau penutupan setelah semua pengujian selesai, seperti menutup koneksi database atau merestore kondisi global. Digunakan ketika tindakan bersih-bersih hanya perlu dilakukan sekali setelah semua pengujian selesai.
    */
    // global.fetch = originalFetch; // Kembalikan global.fetch ke implementasi semula setelah semua pengujian selesai
    // delete global.innerWidth; // Kembalikan nilai global.innerWidth ke nilai semula setelah pengujian selesai
  });
});
