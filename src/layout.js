// Layout.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Sidebar from "./components/sidebar";
import MainContent from "./components/MainContent";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotpassword";
import Appointments from "./pages/appointments";
import News from "./pages/news";
import Users from "./pages/users";
import Reports from "./pages/reports";
import Settings from "./pages/settings";

import Birth from "./pages/birthreg";
import Marriage from "./pages/marriageCert";
import MarriageReg from "./pages/marriage_reg";
import DeathReg from "./pages/death_reg";
import Death from "./pages/deathCert";
import Job from "./pages/job";
import Analytics from "./pages/analytics";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import Helps from "./pages/helps";
import Editables from "./pages/editables";

const Layout = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <MainContent>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/forgotpassword" component={ForgotPassword} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/news" component={News} />
            <Route path="/users" component={Users} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route path="/birthreg" component={Birth} />
            <Route path="/marriageCert" component={Marriage} />
            <Route path="/marriage_reg" component={MarriageReg} />
            <Route path="/death_reg" component={DeathReg} />
            <Route path="/deathCert" component={Death} />
            <Route path="/job" component={Job} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/helps" component={Helps} />
            <Route path="/editables" component={Editables} />

          </Switch>
        </MainContent>
      </div>
    </Router>
  );
};

export default Layout;
