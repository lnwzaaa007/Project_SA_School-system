import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
// import Enrollment from "../pages/enrollment/AddInformation";
import MainPages from "../pages/authentication/Login";
import EnrollmentLayout from "../layout/EnrollmentLayout";
const AddInformation = Loadable(lazy(() => import("../pages/enrollment/AddInformation")));
const CheckStatus = Loadable(lazy(() => import("../pages/enrollment/CheckStatus")));
const EnrollmentRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/enrollment",
    element: isLoggedIn ? <EnrollmentLayout /> : <MainPages />,
    children: [
        {path: "", element: <AddInformation />,
            children: [
                {path: "checkStatus", element: <CheckStatus />},
            ]
        }
    ],

    
    
  };
};

export default EnrollmentRoutes;