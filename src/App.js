import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Signup from './pages/signup';
import Login from './pages/login';

function App() {

  <div><Login/></div>

    return (
        <Router>
            <Switch>
                <Route path="/signup" component={Signup} />
                <Route path="/login" component={Login} />
                {/* Add more routes for other pages as needed */}
            </Switch>
        </Router>
    );
}

export default App;
