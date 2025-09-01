import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import StudentLayout from "../layout/StudentLayout";
const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const Home = Loadable(lazy(() => import("../pages/student/Home")));
const Profile = Loadable(lazy(() => import("../pages/student/StudentProfile")));
const AcademicResult = Loadable(
  lazy(() => import("../pages/student/AcademicResult")),
);
const Attendance = Loadable(lazy(() => import("../pages/student/Attendance")));
const Schedule = Loadable(
  lazy(() => import("../pages/student/ScheduleStudent")),
);
const Upload = Loadable(lazy(() => import("../pages/student/Upload")));
const Payment = Loadable(lazy(() => import("../pages/student/Payment")));
const SlipPayment = Loadable(lazy(() => import("../pages/student/Payment/Slippayment")));
const FileUpload = Loadable(lazy(() => import("../pages/student/Upload/uploadfile")));

const StudentRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/student",
    element: isLoggedIn ? <StudentLayout /> : <MainPages />,
    children: [
      { path: "", element: <Home /> }, // /teacher
      { path: "profile", element: <Profile /> },
      { path: "schedule", element: <Schedule /> },
      { path: "result", element: <AcademicResult /> },
      { path: "checkin", element: <Attendance /> },
      { path: "upload", element: <Upload />, 
        children: [
          { path: "fileupload", element: <FileUpload /> },
        ]
      },
      { path: "payment", element: <Payment />,
        children: [
          { path: "slip", element: <SlipPayment /> },
        ]
       },
    ],
  };
};

export default StudentRoutes;
