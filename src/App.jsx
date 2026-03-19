{/* PRICING PAGE */}
{page === "pricing" && (
  <div>
    <h2>Pricing Plans</h2>
    <div className="plan-card">
      <h3>Basic Plan</h3>
      <p>$10/month</p>
      <button onClick={() => handlePayment('Basic')}>Buy Now</button>
    </div>
    <div className="plan-card">
      <h3>Pro Plan</h3>
      <p>$20/month</p>
      <button onClick={() => handlePayment('Pro')}>Buy Now</button>
    </div>
    <div className="plan-card">
      <h3>Premium Plan</h3>
      <p>$30/month</p>
      <button onClick={() => handlePayment('Premium')}>Buy Now</button>
    </div>
    {/* USDT TRC20 Payment Section */}
    <div className="crypto-payment">
      <h3>Pay with USDT (TRC20)</h3>
      <p>Wallet Address: TUY6KhFdgP3CFP7vFH3ejYdD9tLrVBU764</p>
      <p>Follow these steps for payment:</p>
      <ol>
        <li>Open your crypto wallet app.</li>
        <li>Select Send and enter the wallet address.</li>
        <li>Input the amount you want to pay.</li>
        <li>Confirm the transaction.</li>
      </ol>
      <button onClick={() => copyToClipboard('TUY6KhFdgP3CFP7vFH3ejYdD9tLrVBU764')}>Copy Wallet Address</button>
      <p className="warning">Ensure the wallet address is correct to avoid loss of funds.</p>
    </div>
  </div>
)}