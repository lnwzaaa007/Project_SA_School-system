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
const PaymentListPage = Loadable(lazy(() => import("../pages/student/Payment")));
const PaymentCheckoutPage = Loadable(lazy(() => import("../pages/student/Payment/Slippayment")));
// const AssignmentForm = Loadable(lazy(() => import("../pages/student/Upload/uploadfile")));
import AssignmentForm from "../pages/student/Upload/uploadfile";

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
      
        // children: [
        //   { path: "fileupload/:id", element: <AssignmentForm /> },
        // ]
      },
      { path: "upload/fileupload/:id", element: <AssignmentForm /> }, // หน้า upload แยก
      // ตัวอย่าง
      // {path: "payments", element: < PaymentListPage />} ,
      // {path:"payments/checkout/:id" , element:    < PaymentCheckoutPage />} 
      {
      path: "payments",
      children: [
        { index: true, element: <PaymentListPage /> },       // /student/payments
        { path: "checkout", element: <PaymentCheckoutPage /> } // /student/payments/checkout
      ]
    }

    ],
  };
};

export default StudentRoutes;
