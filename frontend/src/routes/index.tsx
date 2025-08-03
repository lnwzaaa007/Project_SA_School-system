import { useRoutes } from "react-router-dom"; // ลบ RouteObject ออกจากตรงนี้
import type { RouteObject } from "react-router-dom"; // Import RouteObject เป็น type
import StudentRoutes from "./StudentRoutes";
import TeacherRoutes from "./TeacherRoutes";
import MainRoutes from "./MainRoutes";

function ConfigRoutes() {
  //   const isLoggedIn = localStorage.getItem("isLogin") === "true";
  const role = localStorage.getItem("role");
  console.log("User role is:", role);
  let routes: RouteObject[] = [];

  if (role === "teacher") {
    routes = [TeacherRoutes(true), MainRoutes()];
  } else if (role === "student") {
    routes = [StudentRoutes(true), MainRoutes()];
  } else {
    routes = [MainRoutes()];
  }

  return useRoutes(routes);
}

export default ConfigRoutes;

// import type { RouteObject } from "react-router-dom";
// import ChooseRolePage from "../pages/authentication/Login";

// const MainRoutes = (): RouteObject => ({
//   path: "/",
//   element: <ChooseRolePage />,
// });
