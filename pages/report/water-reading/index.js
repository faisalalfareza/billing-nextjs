import MDBox from "/components/MDBox";

import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import dashboardImage from "/assets/images/coming-soon.svg";
import Image from "next/image";

function ReportWaterReading(props) {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} display="flex" justifyContent="center" height="80vh">
        {dashboardImage.src ? (
          <Image
            src={dashboardImage.src}
            alt="coming soon"
            width={500}
            height={500}
            quality={100}
          />
        ) : (
          dashboardImage
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default ReportWaterReading;
