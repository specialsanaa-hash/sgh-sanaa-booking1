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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/booking-types"} component={BookingTypes} />
      <Route path={"/medical-camps"} component={MedicalCamps} />
      <Route path={"/doctor-booking"} component={DoctorBooking} />
      <Route path={"/booking/:formId"} component={Booking} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/form-builder/:formId"} component={FormBuilder} />
      <Route path={"/export-bookings"} component={ExportBookings} />
      <Route path={"/booking-details/:id"} component={BookingDetails} />
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
