// Layout.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Sidebar from './components/sidebar';
import MainContent from './components/MainContent';
import Dashboard from './pages/dashboard';
import Transactions from './pages/transaction';
import Appointments from './pages/appointments';

const Layout = () => {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <MainContent>
                    <Switch>
                        <Route path="/dashboard" component={Dashboard} />
                        <Route path="/transactions" component={Transactions} />
                        <Route path="/appointments" component={Appointments} />
                    </Switch>
                </MainContent>
            </div>
        </Router>
    );
};

export default Layout;
