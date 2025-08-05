import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import AdminLayout from "../layout/AdminLayout";
const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const Home = Loadable(lazy(() => import("../pages/admin/Home")));
const Announce = Loadable(lazy(() => import("../pages/admin/Announce")));
const ManageStudent = Loadable(lazy(() => import("../pages/admin/ManageStudent")));
const ManageTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher")));
const Course = Loadable(lazy(() => import("../pages/admin/Course")));
const Schedule = Loadable(lazy(() => import("../pages/admin/Schedule")));
const Payment = Loadable(lazy(() => import("../pages/admin/Payment")));
const AcademicResult = Loadable(lazy(() => import("../pages/admin/ApplyForStudy")));
const AddSchedule = Loadable(lazy(() => import("../pages/admin/Schedule/AddSchedule")));

const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/admin",
    element: isLoggedIn ? <AdminLayout /> : <MainPages />,
    children: [
      { path: "", element: <Home /> }, // /teacher
      { path: "announce", element: <Announce /> },
      { path: "manageStudent", element: <ManageStudent /> },
      { path: "manageTeacher", element: <ManageTeacher /> },
      { path: "course", element: <Course /> },
      { path: "schedule", element: <Schedule />,
        children:[
          {path:"add",element: <AddSchedule />,}
        ]
       },
      { path: "payment", element: <Payment /> },
      { path: "applyForStudy", element: <AcademicResult /> },
    ],
  };
};

export default AdminRoutes;
