import { Outlet } from "react-router-dom";
import { Content  } from 'antd/es/layout/layout';
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import CheckStatus from "../../pages/enrollment/CheckStatus";
import AddInformation from "../../pages/enrollment/AddInformation";

const EnrollmentLayout: React.FC = () => (
  <>
    <Content
          >
            <Breadcrumb  />
            <div
            >
              <Routes>
                <Route path="" element={<AddInformation />} />
                <Route path="checkStatus" element={<CheckStatus />} />
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
              </Routes>
            </div>
          </Content>
  </>
);

export default EnrollmentLayout;
