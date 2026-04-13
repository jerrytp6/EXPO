import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, ROLE_HOME } from "./store/auth";
import { AppLayout } from "./components/AppLayout";
import { ToastContainer } from "./components/Toast";

import Login from "./pages/Login";
import VendorInvitation from "./pages/vendor/Invitation";
import DecoratorInvitation from "./pages/decor/Invitation";
import VendorPortal from "./pages/portal/VendorPortal";
import DecoratorPortal from "./pages/portal/DecoratorPortal";

import AdminDashboard from "./pages/admin/Dashboard";
import Companies from "./pages/admin/Companies";
import CompanyForm from "./pages/admin/CompanyForm";
import CompanyDetail from "./pages/admin/CompanyDetail";

import CompanyDashboard from "./pages/company/Dashboard";
import Members from "./pages/company/Members";
import Permissions from "./pages/company/Permissions";
import CompanyEvents from "./pages/company/Events";
import EventForm from "./pages/company/EventForm";

import MyEvents from "./pages/event/MyEvents";
import Vendors from "./pages/event/Vendors";
import ImportVendors from "./pages/event/Import";
import Invite from "./pages/event/Invite";
import Monitor from "./pages/event/Monitor";
import SubmissionConfig from "./pages/event/SubmissionConfig";
import SubmissionOverview from "./pages/event/SubmissionOverview";
import DocumentTemplates from "./pages/event/DocumentTemplates";

function Home() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

function Protected({ children, role }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && !(role === "company-admin" && user.role === "member")) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 公開頁（無需登入） */}
        <Route path="/invite/:token" element={<VendorInvitation />} />
        <Route path="/decor-invite/:token" element={<DecoratorInvitation />} />

        {/* 廠商與裝潢公司後台（token-based 訪問） */}
        <Route path="/portal/vendor/:vendorId/*" element={<VendorPortal />} />
        <Route path="/portal/decorator/:decoratorId/*" element={<DecoratorPortal />} />

        {/* Super Admin */}
        <Route path="/admin"               element={<Protected role="super-admin"><AdminDashboard /></Protected>} />
        <Route path="/admin/companies"     element={<Protected role="super-admin"><Companies /></Protected>} />
        <Route path="/admin/companies/new" element={<Protected role="super-admin"><CompanyForm /></Protected>} />
        <Route path="/admin/companies/:id" element={<Protected role="super-admin"><CompanyDetail /></Protected>} />

        {/* Company Admin */}
        <Route path="/company"                element={<Protected role="company-admin"><CompanyDashboard /></Protected>} />
        <Route path="/company/members"      element={<Protected role="company-admin"><Members /></Protected>} />
        <Route path="/company/permissions"  element={<Protected role="company-admin"><Permissions /></Protected>} />
        <Route path="/company/events"       element={<Protected role="company-admin"><CompanyEvents /></Protected>} />
        <Route path="/company/events/new"   element={<Protected role="company-admin"><EventForm /></Protected>} />

        {/* Event Manager */}
        <Route path="/event"                     element={<Protected role="event-manager"><MyEvents /></Protected>} />
        <Route path="/event/:eventId/vendors"    element={<Protected role="event-manager"><Vendors /></Protected>} />
        <Route path="/event/:eventId/import"     element={<Protected role="event-manager"><ImportVendors /></Protected>} />
        <Route path="/event/:eventId/invite"     element={<Protected role="event-manager"><Invite /></Protected>} />
        <Route path="/event/:eventId/monitor"              element={<Protected role="event-manager"><Monitor /></Protected>} />
        <Route path="/event/documents"                         element={<Protected role="event-manager"><DocumentTemplates /></Protected>} />
        <Route path="/event/:eventId/submissions"          element={<Protected role="event-manager"><SubmissionOverview /></Protected>} />
        <Route path="/event/:eventId/submissions/config"   element={<Protected role="event-manager"><SubmissionConfig /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </HashRouter>
  );
}
