import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../util';

interface Availability {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  status: string;
}

const UserDashboard: React.FC = () => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [completedAvailability, setCompletedAvailability] = useState<Availability[]>([]);
  const [day, setDay] = useState<string>('Monday');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Assume this is fetched from the user info

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/availability`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const upcoming = response.data.filter((slot: Availability) => slot.status === 'upcoming');
        const completed = response.data.filter((slot: Availability) => slot.status === 'completed');

        setAvailability(upcoming);
        setCompletedAvailability(completed);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, []);

  const hasTimeConflict = (newStart: string, newEnd: string, existingStart: string, existingEnd: string) => {
    return (
      (newStart >= existingStart && newStart < existingEnd) || 
      (newEnd > existingStart && newEnd <= existingEnd) ||     
      (newStart <= existingStart && newEnd >= existingEnd)      
    );
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startTime || !endTime) {
      setError('Please select both start and end times.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    const conflictingSlot = availability.find(
      (slot) => slot.day === day && hasTimeConflict(startTime, endTime, slot.startTime, slot.endTime)
    );

    if (conflictingSlot) {
      setError(`The selected time conflicts with an existing availability: ${conflictingSlot.startTime} - ${conflictingSlot.endTime}`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/availability`,
        { day, startTime, endTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvailability([...availability, response.data]);
      setDay('Monday');
      setStartTime('');
      setEndTime('');
      setLoading(false);
    } catch (error) {
      setError('Error adding availability.');
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    const filteredAvailability = availability.filter((slot) => slot._id !== id);
    setAvailability(filteredAvailability);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/availability/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      setError('Error deleting availability.');

      const slotToReAdd = availability.find((slot) => slot._id === id);
      if (slotToReAdd) {
        setAvailability([...filteredAvailability, slotToReAdd]);
      }
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_URL}/api/availability/${id}`,
        { status: 'completed' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedAvailability = availability.filter((slot) => slot._id !== id);
      const completedSlot = availability.find((slot) => slot._id === id);
      if (completedSlot) {
        setCompletedAvailability([...completedAvailability, { ...completedSlot, status: 'completed' }]);
      }
      setAvailability(updatedAvailability);
    } catch (error) {
      setError('Error marking availability as completed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-[#0B0C10] text-[#C5C6C7] rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#66FCF1]">Your Availability</h2>

      <div className="flex space-x-8"> 
        {/* Upcoming Availability */}
        <div className="w-1/2">
          <h3 className="text-xl font-semibold mb-4 text-[#66FCF1]">Upcoming Availability</h3>
          {availability.length > 0 ? (
            <ul className="space-y-4">
              {availability.map((slot) => (
                <li key={slot._id} className="flex justify-between items-center p-4 bg-[#1F2833] rounded-lg">
                  <div>
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => markAsCompleted(slot._id)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Mark as Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAvailability(slot._id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No upcoming availability set yet.</p>
          )}
        </div>

        {/* Completed Availability */}
        <div className="w-1/2">
          <h3 className="text-xl font-semibold mb-4 text-[#66FCF1]">Completed Availability</h3>
          {completedAvailability.length > 0 ? (
            <ul className="space-y-4">
              {completedAvailability.map((slot) => (
                <li key={slot._id} className="flex justify-between items-center p-4 bg-[#1F2833] rounded-lg">
                  <div>
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No completed availability yet.</p>
          )}
        </div>
      </div>

      {/* The form for adding availability */}
      <form onSubmit={handleAddAvailability} className="mt-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#C5C6C7]">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-4 py-2 bg-[#1F2833] text-[#C5C6C7] border border-gray-700 rounded-md focus:ring-[#66FCF1] focus:border-[#66FCF1]"
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#C5C6C7]">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#1F2833] text-[#C5C6C7] border border-gray-700 rounded-md focus:ring-[#66FCF1] focus:border-[#66FCF1]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#C5C6C7]">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#1F2833] text-[#C5C6C7] border border-gray-700 rounded-md focus:ring-[#66FCF1] focus:border-[#66FCF1]"
          />
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <button
          type="submit"
          className={`w-full px-4 py-2 bg-[#66FCF1] text-[#0B0C10] font-medium rounded-md hover:bg-[#45A29E] transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Add Availability'}
        </button>
      </form>
    </div>
  );
};

export default UserDashboard;
