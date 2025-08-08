import { Children, lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import AdminLayout from "../layout/AdminLayout";
import ApplyForStudy from "../pages/admin/ApplyForStudy";
const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const Home = Loadable(lazy(() => import("../pages/admin/Home")));
const Announce = Loadable(lazy(() => import("../pages/admin/Announce")));
const ManageStudent = Loadable(lazy(() => import("../pages/admin/ManageStudent")));
const ManageTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher")));
const Course = Loadable(lazy(() => import("../pages/admin/Course")));
const Schedule = Loadable(lazy(() => import("../pages/admin/Schedule")));
const Payment = Loadable(lazy(() => import("../pages/admin/Payment")));
// const AcademicResult = Loadable(lazy(() => import("../pages/admin/ApplyForStudy")));
// const AddSchedule = Loadable(lazy(() => import("../pages/admin/Schedule/AddSchedule")));

const AddStudent = Loadable(lazy(() => import("../pages/admin/ManageStudent/AddStudent/AddStudent")))
const CreateTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/CreateTeacher")));
const DeleteTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/DeleteTeacher")));
const EditTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/EditTeacher")));
const DataTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/CreateTeacher/DataTeacher")));
const AddressTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/CreateTeacher/AddressTeacher")));
const EditDataTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/EditTeacher/EditDataTeacher")));
const EditAddressTeacher = Loadable(lazy(() => import("../pages/admin/ManageTeacher/EditTeacher/EditAddressTeacher")));
const MoveAddStudent = Loadable(lazy(() => import("../pages/admin/ApplyForStudy/MoveAddStudent"))); //toto

const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/admin",
    element: isLoggedIn ? <AdminLayout /> : <MainPages />,
    children: [
      { path: "", element: <Home /> }, // /teacher
      { path: "announce", element: <Announce /> },
      { path: "manageStudent", element: <ManageStudent />,
          children:[
          {path:"AddStudent",element: <AddStudent/>,}
        ]
      },
      { path: "manageTeacher", element: <ManageTeacher />,
        children: [
          {path : "CreateTeacher", element: <CreateTeacher />, children: [{path : "DataTeacher", element: <DataTeacher />}, {path : "AddressTeacher", element: <AddressTeacher />}]},
          {path : "DeleteTeacher", element: <DeleteTeacher />},
          {path : "EditTeacher", element: <EditTeacher />, children: [{path : "EditDataTeacher", element: <EditDataTeacher />}, {path : "EditAddressTeacher", element: <EditAddressTeacher />}]}
        ]
       },
      //  { path: "manageTeacher", element: <ManageTeacher />,
      //   children: [
      //     {path : "DeleteTeacher", element: <DeleteTeacher />}
      //   ]
      //  },
      { path: "course", element: <Course /> },
      { path: "schedule", element: <Schedule />,
        children:[
          // {path:"add",element: <AddSchedule />,}
        ]
       },
      { path: "payment", element: <Payment /> },
      { path: "applyForStudy", element: <ApplyForStudy />, 
        children: [
          {path: "MoveAddStudent", element: <MoveAddStudent />}
        ]
       },
    ],
  };
};

export default AdminRoutes;
