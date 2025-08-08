import MinimalLayout from "../layout/MinimalLayout";
import type { RouteObject } from "react-router-dom";
import MainPages from "../pages/authentication/Login"; // Adjust the import path as necessary
// const MainPages =  import("../pages/authentication/Login");
const MainRoutes = (): RouteObject => {
  return {
    path: "/",
    element: <MinimalLayout />,
    children: [
      {
        path: `/`,
        element: <MainPages />,
      },
      {
        path: `/*`,
        element: <MainPages />,
      },
    ],
  };
};

export default MainRoutes;

// import { useRoutes } from "react-router-dom";
// import type { RouteObject } from "react-router-dom";

// // import AdminRoutes from "./AdminRoutes";
// import StudentRoutes from "./StudentRoutes";
// // import TeacherRoutes from "./TeacherRoutes";
// // import MainRoutes from "./MainRoutes";

// function ConfigRoutes() {
//   const routes: RouteObject[] = [
//     // MainRoutes(),
//     // AdminRoutes(),
//     StudentRoutes(),
//     // TeacherRoutes(),
//   ];

//   return useRoutes(routes);
// }
