// Layout.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Sidebar from "./components/sidebar";
import MainContent from "./components/MainContent";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Transactions from "./pages/transactions";
import Appointments from "./pages/appointments";
import News from "./pages/news";
import Users from "./pages/users";
import Reports from "./pages/reports";
import Birth from "./pages/birthreg";
import Marriage from "./pages/marriageCert";
import Death from "./pages/deathCert";
import Job from "./pages/job";
import Bagong_Silang from "./pages/barangays/Barangay_Bagong_Silang";
import Bucal from "./pages/barangays/Barangay_Bucal";
import Cabasag from "./pages/barangays/Barangay_Cabasag";
import Comadaycaday from "./pages/barangays/Barangay_Comadaycaday";
import Comadogcadog from "./pages/barangays/Barangay_Comadogcadog";
import Domagondong from "./pages/barangays/Barangay_Domagondong";
import Kinalangan from "./pages/barangays/Barangay_Kinalangan";
import Mabini from "./pages/barangays/Barangay_Mabini";
import Magais_1 from "./pages/barangays/Barangay_Magais_1";
import Magais_2 from "./pages/barangays/Barangay_Magais_2";
import Mansalaya from "./pages/barangays/Barangay_Mansalaya";
import Nagkalit from "./pages/barangays/Barangay_Nagkalit";
import Palaspas from "./pages/barangays/Barangay_Palaspas";
import Pamplona from "./pages/barangays/Barangay_Pamplona";
import Pasay from "./pages/barangays/Barangay_Pasay";
import Peñafrancia from "./pages/barangays/Barangay_Peñafrancia";
import Pinagdapian from "./pages/barangays/Barangay_Pinagdapian";
import Pinugusan from "./pages/barangays/Barangay_Pinugusan";
import Pob_Zone_1 from "./pages/barangays/Barangay_Pob.Zone_1";
import Pob_Zone_2 from "./pages/barangays/Barangay_Pob.Zone_2";
import Pob_Zone_3 from "./pages/barangays/Barangay_Pob.Zone_3";
import Sabang from "./pages/barangays/Barangay_Sabang";
import Salvacion from "./pages/barangays/Barangay_Salvacion";
import San_Juan from "./pages/barangays/Barangay_San_Juan";
import San_Pablo from "./pages/barangays/Barangay_San_Pablo";
import Sinuknipan_1 from "./pages/barangays/Barangay_Sinuknipan_1";
import Sinuknipan_2 from "./pages/barangays/Barangay_Sinuknipan_2";
import Sta_Rita_1 from "./pages/barangays/Barangay_Sta.Rita_1";
import Sta_Rita_2 from "./pages/barangays/Barangay_Sta.Rita_2";
import Sugsugin from "./pages/barangays/Barangay_Sugsugin";
import Tabion from "./pages/barangays/Barangay_Tabion";
import Tomagoktok from "./pages/barangays/Barangay_Tomagoktok";
import Analytics from "./pages/analytics2023"

const Layout = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <MainContent>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/news" component={News} />
            <Route path="/users" component={Users} />
            <Route path="/reports" component={Reports} />
            <Route path="/birthreg" component={Birth} />
            <Route path="/marriageCert" component={Marriage} />
            <Route path="/deathCert" component={Death} />
            <Route path="/job" component={Job} />

            <Route path="/bagong_silang" component={Bagong_Silang} />
            <Route path="/bucal" component={Bucal} />
            <Route path="/cabasag" component={Cabasag} />
            <Route path="/comadaycaday" component={Comadaycaday} />
            <Route path="/comadogcadog" component={Comadogcadog} />
            <Route path="/domagondong" component={Domagondong} />
            <Route path="/kinalangan" component={Kinalangan} />
            <Route path="/mabini" component={Mabini} />
            <Route path="/magais1" component={Magais_1} />
            <Route path="/magais2" component={Magais_2} />
            <Route path="/mansalaya" component={Mansalaya} />
            <Route path="/nagkalit" component={Nagkalit} />
            <Route path="/palaspas" component={Palaspas} />
            <Route path="/pamplona" component={Pamplona} />
            <Route path="/pasay" component={Pasay} />
            <Route path="/peñafrancia" component={Peñafrancia} />
            <Route path="/pinagdapian" component={Pinagdapian} />
            <Route path="/pinugusan" component={Pinugusan} />
            <Route path="/pobzone1" component={Pob_Zone_1} />
            <Route path="/pobzone2" component={Pob_Zone_2} />
            <Route path="/pobzone3" component={Pob_Zone_3} />
            <Route path="/sabang" component={Sabang} />
            <Route path="/salvacion" component={Salvacion} />
            <Route path="/sanjuan" component={San_Juan} />
            <Route path="/sanpablo" component={San_Pablo} />
            <Route path="/sinuknipan1" component={Sinuknipan_1} />
            <Route path="/sinuknipan2" component={Sinuknipan_2} />
            <Route path="/starita1" component={Sta_Rita_1} />
            <Route path="/starita2" component={Sta_Rita_2} />
            <Route path="/sugsugin" component={Sugsugin} />
            <Route path="/tabion" component={Tabion} />
            <Route path="/tomagoktok" component={Tomagoktok} />

            <Route path="/analytics" component={Analytics} />

          </Switch>
        </MainContent>
      </div>
    </Router>
  );
};

export default Layout;
