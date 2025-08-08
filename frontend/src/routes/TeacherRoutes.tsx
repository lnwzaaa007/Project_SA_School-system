import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import TeacherLayout from "../layout/TeacherLayout";
const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));

const Home = Loadable(lazy(() => import("../pages/teacher/Home")));
const Profile = Loadable(lazy(() => import("../pages/teacher/TeachProfile")));
const CreateWork = Loadable(lazy(() => import("../pages/teacher/CreateWork")));
const EnterScore = Loadable(lazy(() => import("../pages/teacher/EnterScore")));
const ListOfStudent = Loadable(
  lazy(() => import("../pages/teacher/ListOfStudent")),
);
const AttendanceRecord = Loadable(
  lazy(() => import("../pages/teacher/AttendanceRecord")),
);
const TeachingSchedule = Loadable(
  lazy(() => import("../pages/teacher/TeachingSchedule")),
);

const TeacherRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/teacher",
    element: isLoggedIn ? <TeacherLayout /> : <MainPages />,
    children: [
      { path: "", element: <Home /> }, // /teacher
      { path: "profile", element: <Profile /> },
      { path: "schedule", element: <TeachingSchedule /> },
      { path: "ListOfStudent", element: <ListOfStudent /> },
      { path: "enterScore", element: <EnterScore /> },
      { path: "createWork", element: <CreateWork /> },
      { path: "attendanceRecord", element: <AttendanceRecord /> },
    ],
  };
};

export default TeacherRoutes;
