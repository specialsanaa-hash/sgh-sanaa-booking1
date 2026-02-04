import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import ExportBookings from "./pages/ExportBookings";
import BookingDetails from "./pages/BookingDetails";
import BookingTypes from "./pages/BookingTypes";
import MedicalCamps from "./pages/MedicalCamps";
import DoctorBooking from "./pages/DoctorBooking";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import StaticPage from "./pages/StaticPage";
import ManageDoctors from "./pages/dashboard/ManageDoctors";
import ManageStaticPages from "./pages/dashboard/ManageStaticPages";
import About from "./pages/About";
import Website from "./pages/Website";
import AboutPage from "./pages/AboutPage";
import SpecialtiesPage from "./pages/SpecialtiesPage";
import DoctorsPage from "./pages/DoctorsPage";
import NewsPage from "./pages/NewsPage";
import ContactPage from "./pages/ContactPage";
import PatientsPage from "./pages/PatientsPage";
import BranchPage from "./pages/BranchPage";
import OffersPage from "./pages/OffersPage";
import OurTeamPage from "./pages/OurTeamPage";
import PodcastPage from "./pages/PodcastPage";
import EventsPage from "./pages/EventsPage";
import HomeHealthPage from "./pages/HomeHealthPage";
import InvestorsPage from "./pages/InvestorsPage";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// مكون محمي للـ admin فقط
function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">غير مصرح</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
            {!isAuthenticated && (
              <Button 
                className="w-full" 
                onClick={() => window.location.href = `/`}
              >
                العودة إلى الصفحة الرئيسية
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  // Set RTL direction for all pages
  React.useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/website"} component={Website} />
      <Route path={"/website/about"} component={AboutPage} />
      <Route path={"/website/specialties"} component={SpecialtiesPage} />
      <Route path={"/website/doctors"} component={DoctorsPage} />
      <Route path={"/website/news"} component={NewsPage} />
      <Route path={"/website/contact"} component={ContactPage} />
      <Route path={"/website/patients"} component={PatientsPage} />
      <Route path={"/website/branch"} component={BranchPage} />
      <Route path={"/website/offers"} component={OffersPage} />
      <Route path={"/website/team"} component={OurTeamPage} />
      <Route path={"/website/podcast"} component={PodcastPage} />
      <Route path={"/website/events"} component={EventsPage} />
      <Route path={"/website/home-health"} component={HomeHealthPage} />
      <Route path={"/website/investors"} component={InvestorsPage} />
      <Route path={"/about"} component={About} />
      <Route path={"/booking"} component={Booking} />
      <Route path={"/booking-types"} component={BookingTypes} />
      <Route path={"/medical-camps"} component={MedicalCamps} />
      <Route path={"/doctors"} component={Doctors} />
      <Route path={"/doctor/:id"} component={DoctorDetail} />
      <Route path={"/page/:slug"} component={StaticPage} />
      <Route path={"/booking-details/:id"} component={BookingDetails} />
      <Route path={"/export-bookings"} component={() => <ProtectedAdminRoute component={ExportBookings} />} />
      <Route path={"/dashboard"} component={() => <ProtectedAdminRoute component={Dashboard} />} />
      <Route path={"/dashboard/form-builder"} component={() => <ProtectedAdminRoute component={FormBuilder} />} />
      <Route path={"/dashboard/manage-doctors"} component={() => <ProtectedAdminRoute component={ManageDoctors} />} />
      <Route path={"/dashboard/manage-pages"} component={() => <ProtectedAdminRoute component={ManageStaticPages} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
