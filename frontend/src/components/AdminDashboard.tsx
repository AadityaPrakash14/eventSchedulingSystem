import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../util';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Availability {
  _id: string;
  userId: User;
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduledSession {
  _id: string;
  day: string;
  sessionType: string;
  users: User[];
  availabilities: string[];
}

const AdminDashboard: React.FC = () => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [availableUsersForDay, setAvailableUsersForDay] = useState<Availability[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [sessionType, setSessionType] = useState<string>('one-on-one');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch initial data: availability and scheduled sessions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const availabilityResponse = await axios.get(`${BACKEND_URL}/api/admin/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const scheduledResponse = await axios.get(`${BACKEND_URL}/api/admin/scheduled-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAvailability(availabilityResponse.data);
        setScheduledSessions(scheduledResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error fetching data');
      }
    };
    fetchData();
  }, []);

  // Filter availability for the selected day
  useEffect(() => {
    const filterAvailabilityForDay = () => {
      const availableSlotsForDay = availability.filter(
        (slot) =>
          slot.day.toLowerCase() === selectedDay.toLowerCase() &&
          !scheduledSessions.some((session) => session?.availabilities?.includes(slot._id)) // Exclude scheduled availabilities
      );
      setAvailableUsersForDay(availableSlotsForDay);
    };

    filterAvailabilityForDay();
  }, [selectedDay, availability, scheduledSessions]);

  // Handle selecting an availability
  const handleAvailabilitySelection = (availabilityId: string) => {
    if (sessionType === 'one-on-one' && selectedAvailabilities.length >= 1 && !selectedAvailabilities?.includes(availabilityId)) {
      setErrorMessage('Only one availability can be selected for a one-on-one session.');
      return;
    }

    setSelectedAvailabilities((prevSelected) =>
      prevSelected?.includes(availabilityId)
        ? prevSelected.filter((id) => id !== availabilityId)
        : [...prevSelected, availabilityId]
    );
    setErrorMessage('');
  };

  // Handle scheduling a session
  const handleScheduleSession = async () => {
    if (selectedAvailabilities.length === 0) {
      setErrorMessage('Please select at least one availability.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Send request to backend to create a new session
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/schedule`,
        { day: selectedDay, availabilities: selectedAvailabilities, sessionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch the scheduled session data from the response
      const newSession = response.data;

      // Add the new session to the `scheduledSessions` state
      setScheduledSessions((prevSessions) => [
        ...prevSessions,
        {
          _id: newSession._id,
          day: selectedDay, // Ensure the day is set correctly
          sessionType: sessionType, // Ensure the sessionType is correctly set
          users: newSession.users || [], // Populate users from the response
          availabilities: selectedAvailabilities // Set the availabilities you selected
        },
      ]);

      // Remove the scheduled availabilities from the available list
      setAvailability((prevAvailability) => 
        prevAvailability.filter((slot) => !selectedAvailabilities.includes(slot._id))
      );

      resetForm();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setErrorMessage('Error scheduling session.');
      setLoading(false);
    }
  };

  // Handle unscheduling a session
  const handleUnscheduleSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const sessionToUnschedule = scheduledSessions.find((session) => session._id === sessionId);
      
      await axios.delete(`${BACKEND_URL}/api/admin/scheduled-sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Move the unscheduled availabilities back to availability
      setScheduledSessions((prevSessions) => prevSessions.filter((session) => session._id !== sessionId));
      setAvailability((prevAvailability) => [
        ...prevAvailability,
        ...availability.filter((slot) => sessionToUnschedule?.availabilities?.includes(slot._id))
      ]);
    } catch (error) {
      console.log(error);
      setErrorMessage('Error unscheduling session.');
    }
  };

  // Reset form after scheduling
  const resetForm = () => {
    setSelectedAvailabilities([]);
    setSessionType('one-on-one');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] p-8">
      <div className="max-w-7xl mx-auto flex space-x-8">
        {/* Left Section (Scheduling Form) */}
        <div className="w-1/2 bg-[#1F2833] p-8 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-[#66FCF1] mb-8 text-center">Admin Dashboard</h2>

          {/* Select Day */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-[#C5C6C7] mb-2">Select Day:</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-2 bg-[#1F2833] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Display Available Users */}
          <div className="mb-6">
            <h3 className="text-2xl font-medium text-[#66FCF1] mb-4">Users Available on {selectedDay}:</h3>
            {availableUsersForDay.length > 0 ? (
              <ul className="space-y-4">
                {availableUsersForDay.map((user) => (
                  <li key={user._id} className="flex justify-between items-center p-4 bg-[#0B0C10] border border-gray-600 rounded-lg">
                    <div>
                      <p className="text-lg font-medium text-white">{user.userId.name} ({user.userId.email})</p>
                      <p className="text-sm text-[#C5C6C7]">
                        Available: {user.startTime} - {user.endTime}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedAvailabilities?.includes(user._id)}
                      onChange={() => handleAvailabilitySelection(user._id)}
                      className="h-6 w-6 text-[#66FCF1] border-gray-600 rounded focus:ring-[#66FCF1]"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No users available on this day.</p>
            )}
          </div>

          {/* Select Session Type */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-[#C5C6C7] mb-2">Session Type:</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-4 py-2 bg-[#1F2833] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            >
              <option value="one-on-one">One-on-One</option>
              <option value="multi-participant">Multi-Participant</option>
            </select>
          </div>

          {/* Error Message */}
          {errorMessage && <p className="text-red-400 mb-4">{errorMessage}</p>}

          {/* Schedule Button */}
          <button
            onClick={handleScheduleSession}
            className={`w-full px-4 py-2 bg-[#66FCF1] text-[#0B0C10] font-medium rounded-lg hover:bg-[#45A29E] transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Scheduling...' : 'Schedule Session'}
          </button>
        </div>

        {/* Right Section (Scheduled Sessions) */}
        <div className="w-1/2 bg-[#1F2833] p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-[#66FCF1] mb-6">Scheduled Sessions</h3>

          {scheduledSessions.length > 0 ? (
            <ul className="space-y-4">
              {scheduledSessions.map((session) => (
                <li key={session._id} className="p-4 bg-[#0B0C10] border border-gray-600 rounded-lg">
                  <p className="text-lg font-medium text-white">{session.day} ({session.sessionType})</p>
                  <p className="text-sm text-[#C5C6C7]">
                    Participants: {session?.users?.map((user) => user.name).join(', ')}
                  </p>
                  <button
                    onClick={() => handleUnscheduleSession(session._id)}
                    className="text-red-400 hover:text-red-600 mt-2"
                  >
                    Unschedule
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No scheduled sessions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
