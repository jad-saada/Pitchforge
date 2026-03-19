import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Welcome to Pitchforge</h1>

      {/* Other sections here */}

      {/* PRICING PAGE section start */}
      <section>
        <h2>Pricing</h2>
        <p>Our pricing options are flexible to meet your needs.</p>
        <ul>
          <li>
            <h3>Basic Plan - $10/month</h3>
            <p>Access to basic features.</p>
          </li>
          <li>
            <h3>Pro Plan - $30/month</h3>
            <p>Access to all features and priority support.</p>
          </li>
          <li>
            <h3>Premium Plan - $50/month</h3>
            <p>All features plus additional perks.</p>
          </li>
          <li>
            <h3>USDT TRC20 Payment Option</h3>
            <p>Pay with USDT TRC20 and get a 10% discount on your first subscription!</p>
            <p>Please contact our support to set up your USDT payment.</p>
          </li>
        </ul>
      </section>
      {/* PRICING PAGE section end */}
    </div>
  );
}

export default App;