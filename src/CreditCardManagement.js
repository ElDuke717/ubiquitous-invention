// CreditCardManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function CreditCardManagement() {
  const [creditCards, setCreditCards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [newCard, setNewCard] = useState({
    lastFourDigits: "",
    type: "",
    issuer: "",
    expirationDate: "",
    generalUse: "",
    nickname: "",
    creditLimit: "",
    currentBalance: "",
    minimumPayment: "",
    paymentDueDate: "",
    interestRate: "",
    rewardsProgram: "",
    cardStatus: "",
    authorizedUsers: "",
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentCardData, setCurrentCardData] = useState({});

  // Fetch credit cards from the backend
  const fetchCreditCards = () => {
    axios
      .get("/api/credit-cards", { withCredentials: true })
      .then((response) => {
        setCreditCards(response.data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchCreditCards();
  }, []);

  // Handle input changes for new card
  const handleNewCardChange = (e) => {
    setNewCard({
      ...newCard,
      [e.target.name]: e.target.value,
    });
  };

  // Add new credit card
  const handleAddCard = (e) => {
    e.preventDefault();
    // Validation can be added here

    axios
      .post("/api/credit-cards", newCard, {
        withCredentials: true,
      })
      .then((response) => {
        alert("Credit card added successfully!");
        setShowAddModal(false);
        setNewCard({
          lastFourDigits: "",
          type: "",
          issuer: "",
          expirationDate: "",
          generalUse: "",
          nickname: "",
          creditLimit: "",
          currentBalance: "",
          minimumPayment: "",
          paymentDueDate: "",
          interestRate: "",
          rewardsProgram: "",
          cardStatus: "",
          authorizedUsers: "",
          notes: "",
        });
        fetchCreditCards();
      })
      .catch((error) => console.error(error));
  };

  // Open more info modal
  const handleViewMore = (card) => {
    setCurrentCard(card);
    setShowInfoModal(true);
  };

  // Open edit modal
  // Functions to handle editing
  const startEdit = () => {
    setIsEditing(true);
    setCurrentCardData({ ...currentCard }); // Clone currentCard data
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleCurrentCardChange = (e) => {
    setCurrentCardData({
      ...currentCardData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateCard = (e) => {
    e.preventDefault();
    // Send updated data to backend
    axios
      .put(
        `/api/credit-cards/${currentCard.id}`,
        currentCardData
      )
      .then((response) => {
        alert("Credit card updated successfully!");
        setIsEditing(false);
        setShowInfoModal(false);
        fetchCreditCards(); // Refresh the list
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">Credit Card Management</h2>
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600 mb-5"
      >
        Add a New Card
      </button>

      {/* Add New Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Credit Card</h3>
            <form
              onSubmit={handleAddCard}
              className="space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Form fields */}
              {/* Last Four Digits */}
              <div>
                <label className="block text-gray-700">Last Four Digits</label>
                <input
                  type="text"
                  name="lastFourDigits"
                  value={newCard.lastFourDigits}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  maxLength="4"
                  required
                />
              </div>
              {/* Type */}
              <div>
                <label className="block text-gray-700">Type</label>
                <select
                  name="type"
                  value={newCard.type}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                  {/* Add other types as needed */}
                </select>
              </div>
              {/* Issuer */}
              <div>
                <label className="block text-gray-700">Issuer</label>
                <input
                  type="text"
                  name="issuer"
                  value={newCard.issuer}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              {/* Expiration Date */}
              <div>
                <label className="block text-gray-700">Expiration Date</label>
                <input
                  type="month"
                  name="expirationDate"
                  value={newCard.expirationDate}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              {/* General Use */}
              <div>
                <label className="block text-gray-700">General Use</label>
                <input
                  type="text"
                  name="generalUse"
                  value={newCard.generalUse}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Additional Fields in the modal */}
              {/* Nickname */}
              <div>
                <label className="block text-gray-700">Nickname</label>
                <input
                  type="text"
                  name="nickname"
                  value={newCard.nickname}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Credit Limit */}
              <div>
                <label className="block text-gray-700">Credit Limit ($)</label>
                <input
                  type="number"
                  name="creditLimit"
                  value={newCard.creditLimit}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Current Balance */}
              <div>
                <label className="block text-gray-700">
                  Current Balance ($)
                </label>
                <input
                  type="number"
                  name="currentBalance"
                  value={newCard.currentBalance}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Minimum Payment */}
              <div>
                <label className="block text-gray-700">
                  Minimum Payment ($)
                </label>
                <input
                  type="number"
                  name="minimumPayment"
                  value={newCard.minimumPayment}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Payment Due Date */}
              <div>
                <label className="block text-gray-700">Payment Due Date</label>
                <input
                  type="date"
                  name="paymentDueDate"
                  value={newCard.paymentDueDate}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Interest Rate */}
              <div>
                <label className="block text-gray-700">
                  Interest Rate (APR %)
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={newCard.interestRate}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  step="0.01"
                />
              </div>
              {/* Rewards Program */}
              <div>
                <label className="block text-gray-700">
                  Rewards Program Details
                </label>
                <textarea
                  name="rewardsProgram"
                  value={newCard.rewardsProgram}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  rows="3"
                ></textarea>
              </div>
              {/* Card Status */}
              <div>
                <label className="block text-gray-700">Card Status</label>
                <select
                  name="cardStatus"
                  value={newCard.cardStatus}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              {/* Authorized Users */}
              <div>
                <label className="block text-gray-700">Authorized Users</label>
                <input
                  type="text"
                  name="authorizedUsers"
                  value={newCard.authorizedUsers}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <small className="text-gray-500">
                  Separate names with commas.
                </small>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={newCard.notes}
                  onChange={handleNewCardChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  rows="3"
                ></textarea>
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List of Credit Cards */}
      <div className="grid grid-cols-1 gap-6">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{card.nickname}</h2>
            <h3 className="text-xl font-semibold mb-2">
              {card.issuer} {card.type} **** **** **** ****{" "}
              {card.lastFourDigits}
            </h3>
            <p className="text-gray-700">
              Last Four Digits:{" "}
              <span className="font-bold">{card.lastFourDigits}</span>
            </p>
            <p className="text-gray-700">
              Expiration Date:{" "}
              <span className="font-bold">{card.expirationDate}</span>
            </p>
            <p className="text-gray-700">
              General Use: <span className="font-bold">{card.generalUse}</span>
            </p>
            <button
              onClick={() => handleViewMore(card)}
              className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600"
            >
              See More Information
            </button>
          </div>
        ))}
      </div>

      {/* More Information Modal */}
      {showInfoModal && currentCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Credit Card Details</h3>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              {isEditing ? (
                // Editable Form
                <form onSubmit={handleUpdateCard} className="space-y-4">
                  {/* Nickname */}
                  <div>
                    <label className="block text-gray-700">Nickname</label>
                    <input
                      type="text"
                      name="nickname"
                      value={currentCardData.nickname}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Last Four Digits */}
                  <div>
                    <label className="block text-gray-700">
                      Last Four Digits
                    </label>
                    <input
                      type="text"
                      name="lastFourDigits"
                      value={currentCardData.lastFourDigits}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      maxLength="4"
                      readOnly // Since last four digits shouldn't change
                    />
                  </div>
                  {/* Type */}
                  <div>
                    <label className="block text-gray-700">
                      Type (Visa, Mastercard, etc.)
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={currentCardData.type}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Issuer */}
                  <div>
                    <label className="block text-gray-700">Issuer</label>
                    <input
                      type="text"
                      name="issuer"
                      value={currentCardData.issuer}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Expiration Date */}
                  <div>
                    <label className="block text-gray-700">
                      Expiration Date
                    </label>
                    <input
                      type="month"
                      name="expirationDate"
                      value={currentCardData.expirationDate}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* General Use */}
                  <div>
                    <label className="block text-gray-700">General Use</label>
                    <input
                      type="text"
                      name="generalUse"
                      value={currentCardData.generalUse}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Credit Limit */}
                  <div>
                    <label className="block text-gray-700">
                      Credit Limit ($)
                    </label>
                    <input
                      type="number"
                      name="creditLimit"
                      value={currentCardData.creditLimit}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Current Balance */}
                  <div>
                    <label className="block text-gray-700">
                      Current Balance ($)
                    </label>
                    <input
                      type="number"
                      name="currentBalance"
                      value={currentCardData.currentBalance}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Minimum Payment */}
                  <div>
                    <label className="block text-gray-700">
                      Minimum Payment ($)
                    </label>
                    <input
                      type="number"
                      name="minimumPayment"
                      value={currentCardData.minimumPayment}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Payment Due Date */}
                  <div>
                    <label className="block text-gray-700">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      name="paymentDueDate"
                      value={currentCardData.paymentDueDate}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Interest Rate (APR) */}
                  <div>
                    <label className="block text-gray-700">
                      Interest Rate (APR %)
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={currentCardData.interestRate}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      step="0.01"
                    />
                  </div>
                  {/* Rewards Program */}
                  <div>
                    <label className="block text-gray-700">
                      Rewards Program
                    </label>
                    <textarea
                      name="rewardsProgram"
                      value={currentCardData.rewardsProgram}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      rows="3"
                    ></textarea>
                  </div>
                  {/* Card Status */}
                  <div>
                    <label className="block text-gray-700">
                      Card Status (Active, Suspended, etc.)
                    </label>
                    <input
                      type="text"
                      name="cardStatus"
                      value={currentCardData.cardStatus}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  {/* Authorized Users */}
                  <div>
                    <label className="block text-gray-700">
                      Authorized Users
                    </label>
                    <input
                      type="text"
                      name="authorizedUsers"
                      value={currentCardData.authorizedUsers}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                    <small className="text-gray-500">
                      Separate names with commas.
                    </small>
                  </div>
                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      value={currentCardData.notes}
                      onChange={handleCurrentCardChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      rows="3"
                    ></textarea>
                  </div>
                  {/* Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <>
                  <p>
                    <strong>Nickname:</strong> {currentCard.nickname}
                  </p>
                  <p>
                    <strong>Last Four Digits:</strong>{" "}
                    {currentCard.lastFourDigits}
                  </p>
                  <p>
                    <strong>Type:</strong> {currentCard.type}
                  </p>
                  <p>
                    <strong>Issuer:</strong> {currentCard.issuer}
                  </p>
                  <p>
                    <strong>Expiration Date:</strong>{" "}
                    {currentCard.expirationDate}
                  </p>
                  <p>
                    <strong>General Use:</strong> {currentCard.generalUse}
                  </p>
                  <p>
                    <strong>Credit Limit:</strong> ${currentCard.creditLimit}
                  </p>
                  <p>
                    <strong>Current Balance:</strong> $
                    {currentCard.currentBalance}
                  </p>
                  <p>
                    <strong>Minimum Payment:</strong> $
                    {currentCard.minimumPayment}
                  </p>
                  <p>
                    <strong>Payment Due Date:</strong>{" "}
                    {currentCard.paymentDueDate}
                  </p>
                  <p>
                    <strong>Interest Rate:</strong> {currentCard.interestRate}%
                  </p>
                  <p>
                    <strong>Rewards Program:</strong>{" "}
                    {currentCard.rewardsProgram}
                  </p>
                  <p>
                    <strong>Card Status:</strong> {currentCard.cardStatus}
                  </p>
                  <p>
                    <strong>Authorized Users:</strong>{" "}
                    {currentCard.authorizedUsers}
                  </p>
                  <p>
                    <strong>Notes:</strong> {currentCard.notes}
                  </p>
                </>
              )}
            </div>
            {!isEditing && (
              <div className="flex justify-end mt-4 space-x-4">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-blue-600"
                >
                  Close
                </button>
                <button
                  onClick={startEdit}
                  className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-yellow-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditCardManagement;
