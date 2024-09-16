// JournalPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JournalPage() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    date: '',
    content: '',
  });
  const [page, setPage] = useState(1);

  const fetchJournalEntries = () => {
    axios
      .get('http://localhost:5001/journal', {
        params: { page, limit: 10 },
      })
      .then((response) => {
        setJournalEntries(response.data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [page]);

  const handleInputChange = (e) => {
    setNewEntry({
      ...newEntry,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEntry = (e) => {
    e.preventDefault();

    if (!newEntry.title || !newEntry.date || !newEntry.content) {
      alert('Please fill in all required fields.');
      return;
    }

    axios
      .post('http://localhost:5001/journal', newEntry)
      .then((response) => {
        alert('Journal entry added successfully!');
        setShowModal(false);
        setNewEntry({ title: '', date: '', content: '' });
        fetchJournalEntries();
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">Finance Journal</h2>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600 mb-5"
      >
        Add New Entry
      </button>

      {/* Modal for adding new entry */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
            <h3 className="text-xl font-bold mb-4">New Journal Entry</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEntry.title}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newEntry.date}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Content</label>
                <textarea
                  name="content"
                  value={newEntry.content}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  rows="5"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List of journal entries */}
      <div className="space-y-6">
        {journalEntries.map((entry) => (
          <div key={entry.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{entry.date}</p>
            <p>{entry.content}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600"
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default JournalPage;