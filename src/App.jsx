import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, ROLE_HOME } from "./store/auth";
import { AppLayout } from "./components/AppLayout";
import { ToastContainer } from "./components/Toast";

import Login from "./pages/Login";
import PortalHome from "./pages/PortalHome";
import SsoReceiver from "./pages/SsoReceiver";
import VendorInvitation from "./pages/vendor/Invitation";
import VendorRsvp from "./pages/vendor/Rsvp";
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
import VendorAccounts from "./pages/company/VendorAccounts";
import DecoratorAccounts from "./pages/company/DecoratorAccounts";
import EmailTemplates from "./pages/company/EmailTemplates";
import Smtp from "./pages/company/Smtp";

import MyEvents from "./pages/event/MyEvents";
import Vendors from "./pages/event/Vendors";
import ImportVendors from "./pages/event/Import";
import Invite from "./pages/event/Invite";
import Recruit from "./pages/event/Recruit";
import Monitor from "./pages/event/Monitor";
import Booths from "./pages/event/Booths";
import SubmissionConfig from "./pages/event/SubmissionConfig";
import SubmissionOverview from "./pages/event/SubmissionOverview";
import DocumentTemplates from "./pages/event/DocumentTemplates";
import Notices from "./pages/event/Notices";
import Forms from "./pages/event/Forms";
import EquipmentCatalog from "./pages/event/EquipmentCatalog";
import PreEventNotice from "./pages/event/PreEventNotice";
import EventEmailTemplates from "./pages/event/EventEmailTemplates";
import FormReview from "./pages/event/FormReview";

function Home() {
  const user = useAuth((s) => s.user);
  // 未登入 → 導向 Mock Portal（模擬客戶的 SSO 入口）
  if (!user) return <Navigate to="/portal" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/portal"} replace />;
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

        {/* Mock Portal SSO 入口（模擬客戶的統一認證平台首頁）*/}
        <Route path="/portal" element={<PortalHome />} />
        <Route path="/sso" element={<SsoReceiver />} />

        {/* 公開頁（無需登入） */}
        <Route path="/invite/:token" element={<VendorInvitation />} />
        <Route path="/rsvp/:token" element={<VendorRsvp />} />
        <Route path="/decor-invite/:token" element={<DecoratorInvitation />} />

        {/* 廠商與裝潢公司後台（token-based 訪問） */}
        <Route path="/portal/vendor/:vendorId/*" element={<VendorPortal />} />
        <Route path="/portal/decorator/:decoratorId/*" element={<DecoratorPortal />} />

        {/* Super Admin */}
        <Route path="/admin"               element={<Protected role="super-admin"><AdminDashboard /></Protected>} />
        <Route path="/admin/companies"     element={<Protected role="super-admin"><Companies /></Protected>} />
        <Route path="/admin/companies/new" element={<Protected role="super-admin"><CompanyForm /></Protected>} />
        <Route path="/admin/companies/:id" element={<Protected role="super-admin"><CompanyDetail /></Protected>} />

        {/* Company Admin（租戶層 — 客戶模組 #9/#10/#11/#12/#13）*/}
        <Route path="/company"                     element={<Protected role="company-admin"><CompanyDashboard /></Protected>} />
        <Route path="/company/members"             element={<Protected role="company-admin"><Members /></Protected>} />
        <Route path="/company/permissions"         element={<Protected role="company-admin"><Permissions /></Protected>} />
        <Route path="/company/events"              element={<Protected role="company-admin"><CompanyEvents /></Protected>} />
        <Route path="/company/events/new"          element={<Protected role="company-admin"><EventForm /></Protected>} />
        <Route path="/company/vendor-accounts"     element={<Protected role="company-admin"><VendorAccounts /></Protected>} />
        <Route path="/company/decorator-accounts"  element={<Protected role="company-admin"><DecoratorAccounts /></Protected>} />
        <Route path="/company/email-templates"     element={<Protected role="company-admin"><EmailTemplates /></Protected>} />
        <Route path="/company/smtp"                element={<Protected role="company-admin"><Smtp /></Protected>} />

        {/* Event Manager（活動層 — 客戶模組 #1～#8） */}
        <Route path="/event"                                element={<Protected role="event-manager"><MyEvents /></Protected>} />
        <Route path="/event/:eventId/vendors"               element={<Protected role="event-manager"><Vendors /></Protected>} />
        <Route path="/event/:eventId/recruit"               element={<Protected role="event-manager"><Recruit /></Protected>} />
        <Route path="/event/:eventId/import"                element={<Protected role="event-manager"><ImportVendors /></Protected>} />
        <Route path="/event/:eventId/invite"                element={<Protected role="event-manager"><Invite /></Protected>} />
        <Route path="/event/:eventId/monitor"               element={<Protected role="event-manager"><Monitor /></Protected>} />
        <Route path="/event/:eventId/booths"                element={<Protected role="event-manager"><Booths /></Protected>} />
        <Route path="/event/:eventId/notices"               element={<Protected role="event-manager"><Notices /></Protected>} />
        <Route path="/event/:eventId/forms"                 element={<Protected role="event-manager"><Forms /></Protected>} />
        <Route path="/event/:eventId/form-review"           element={<Protected role="event-manager"><FormReview /></Protected>} />
        <Route path="/event/:eventId/equipment"             element={<Protected role="event-manager"><EquipmentCatalog /></Protected>} />
        <Route path="/event/:eventId/pre-event"             element={<Protected role="event-manager"><PreEventNotice /></Protected>} />
        <Route path="/event/:eventId/email-templates"       element={<Protected role="event-manager"><EventEmailTemplates /></Protected>} />
        <Route path="/event/documents"                      element={<Protected role="event-manager"><DocumentTemplates /></Protected>} />
        <Route path="/event/:eventId/submissions"           element={<Protected role="event-manager"><SubmissionOverview /></Protected>} />
        <Route path="/event/:eventId/submissions/config"    element={<Protected role="event-manager"><SubmissionConfig /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </HashRouter>
  );
}
