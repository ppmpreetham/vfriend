import React, { useState, useEffect, useCallback } from 'react';
import { checkConflicts, findCommonFreeTimes, isUserFreeAt } from '../../utils/timetableHelper';

// Sample timetable data
const userTimetable = {
  u: "ppmpreetham",
  t: "2025-06-13T05:09:08+00:00", // Current timestamp
  o: [
    // Monday (d: 1)
    {d: 1, s: "t", p: 1, f: "BCSE101L-Programming Fundamentals-TH-AB3-101-ALL"},
    {d: 1, s: "t", p: 3, f: "BMAT201L-Mathematics III-TH-AB3-206-ALL"},
    {d: 1, s: "t", p: 8, f: "BCSE420L-Machine Learning-TH-AB3-305-ALL"},
    {d: 1, s: "t", p: 9, f: "BCSE303L-Database Systems-TH-AB3-501-ALL"},
    {d: 1, s: "t", p: 11, f: "BHUM102L-Technical Communication-TH-AB3-102-ALL"},
    
    // Tuesday (d: 2) 
    {d: 2, s: "l", p: 1, f: "L1-BCSE420P-ML Lab-LO-AB3-311-ALL"},
    {d: 2, s: "l", p: 2, f: "L2-BCSE420P-ML Lab-LO-AB3-311-ALL"},
    {d: 2, s: "t", p: 4, f: "BCSE302L-Computer Networks-TH-AB3-303-ALL"},
    {d: 2, s: "t", p: 7, f: "BCSE401L-Software Engineering-TH-AB3-402-ALL"},
    {d: 2, s: "t", p: 10, f: "BCSE205L-Data Structures-TH-AB3-201-ALL"},
    
    // Wednesday (d: 3)
    {d: 3, s: "t", p: 2, f: "BMAT201L-Mathematics III-TH-AB3-206-ALL"},
    {d: 3, s: "t", p: 5, f: "BCSE303L-Database Systems-TH-AB3-501-ALL"},
    {d: 3, s: "l", p: 8, f: "L5-BCSE303P-DB Lab-LO-AB3-611-ALL"},
    {d: 3, s: "l", p: 9, f: "L6-BCSE303P-DB Lab-LO-AB3-611-ALL"},
    {d: 3, s: "t", p: 11, f: "BCSE420L-Machine Learning-TH-AB3-305-ALL"},
    
    // Thursday (d: 4)
    {d: 4, s: "t", p: 1, f: "BCSE302L-Computer Networks-TH-AB3-303-ALL"},
    {d: 4, s: "t", p: 3, f: "BCSE401L-Software Engineering-TH-AB3-402-ALL"},
    {d: 4, s: "l", p: 7, f: "L9-BCSE302P-Networks Lab-LO-AB3-412-ALL"},
    {d: 4, s: "l", p: 8, f: "L10-BCSE302P-Networks Lab-LO-AB3-412-ALL"},
    {d: 4, s: "t", p: 10, f: "BHUM102L-Technical Communication-TH-AB3-102-ALL"},
    
    // Friday (d: 5)
    {d: 5, s: "t", p: 2, f: "BCSE101L-Programming Fundamentals-TH-AB3-101-ALL"},
    {d: 5, s: "t", p: 4, f: "BCSE205L-Data Structures-TH-AB3-201-ALL"},
    {d: 5, s: "t", p: 6, f: "BMAT201L-Mathematics III-TH-AB3-206-ALL"},
    {d: 5, s: "l", p: 9, f: "L13-BCSE101P-Programming Lab-LO-AB3-511-ALL"},
    {d: 5, s: "l", p: 10, f: "L14-BCSE101P-Programming Lab-LO-AB3-511-ALL"},
    
    // Saturday (d: 6) - Light schedule
    {d: 6, s: "t", p: 1, f: "BCSE420L-Machine Learning-TH-AB3-305-ALL"},
    {d: 6, s: "t", p: 8, f: "BCSE999L-Seminar-TH-AB3-AUD-ALL"},
    
    // Sunday (d: 7) - No classes (free day)
  ]
};

const friendTimetable = {
  u: "arjun_student",
  t: "2025-06-13T05:08:45+00:00",
  o: [
    // Monday (d: 1) - Some overlap with user
    {d: 1, s: "t", p: 2, f: "BCSE201L-Object Oriented Programming-TH-AB3-202-ALL"},
    {d: 1, s: "t", p: 3, f: "BMAT201L-Mathematics III-TH-AB3-206-ALL"}, // CONFLICT with user
    {d: 1, s: "t", p: 9, f: "BCSE303L-Database Systems-TH-AB3-501-ALL"}, // CONFLICT with user
    {d: 1, s: "t", p: 12, f: "BCSE404L-Operating Systems-TH-AB3-403-ALL"},
    
    // Tuesday (d: 2)
    {d: 2, s: "t", p: 3, f: "BCSE201L-Object Oriented Programming-TH-AB3-202-ALL"},
    {d: 2, s: "l", p: 4, f: "L3-BCSE201P-OOP Lab-LO-AB3-212-ALL"},
    {d: 2, s: "l", p: 5, f: "L4-BCSE201P-OOP Lab-LO-AB3-212-ALL"},
    {d: 2, s: "t", p: 8, f: "BCSE404L-Operating Systems-TH-AB3-403-ALL"},
    {d: 2, s: "t", p: 11, f: "BHUM103L-Ethics and Values-TH-AB3-103-ALL"},
    
    // Wednesday (d: 3)
    {d: 3, s: "t", p: 1, f: "BCSE302L-Computer Networks-TH-AB3-303-ALL"},
    {d: 3, s: "t", p: 4, f: "BMAT202L-Discrete Mathematics-TH-AB3-207-ALL"},
    {d: 3, s: "t", p: 6, f: "BCSE404L-Operating Systems-TH-AB3-403-ALL"},
    {d: 3, s: "l", p: 10, f: "L7-BCSE404P-OS Lab-LO-AB3-413-ALL"},
    {d: 3, s: "l", p: 11, f: "L8-BCSE404P-OS Lab-LO-AB3-413-ALL"},
    
    // Thursday (d: 4)
    {d: 4, s: "t", p: 2, f: "BMAT202L-Discrete Mathematics-TH-AB3-207-ALL"},
    {d: 4, s: "t", p: 4, f: "BCSE201L-Object Oriented Programming-TH-AB3-202-ALL"},
    {d: 4, s: "t", p: 6, f: "BCSE302L-Computer Networks-TH-AB3-303-ALL"},
    {d: 4, s: "t", p: 9, f: "BHUM103L-Ethics and Values-TH-AB3-103-ALL"},
    {d: 4, s: "t", p: 12, f: "BCSE999L-Project Review-TH-AB3-AUD-ALL"},
    
    // Friday (d: 5)
    {d: 5, s: "l", p: 1, f: "L11-BCSE302P-Networks Lab-LO-AB3-412-ALL"},
    {d: 5, s: "l", p: 2, f: "L12-BCSE302P-Networks Lab-LO-AB3-412-ALL"},
    {d: 5, s: "t", p: 5, f: "BMAT202L-Discrete Mathematics-TH-AB3-207-ALL"},
    {d: 5, s: "t", p: 7, f: "BCSE404L-Operating Systems-TH-AB3-403-ALL"},
    {d: 5, s: "t", p: 11, f: "BCSE302L-Computer Networks-TH-AB3-303-ALL"},
    
    // Saturday (d: 6)
    {d: 6, s: "t", p: 3, f: "BCSE999L-Guest Lecture-TH-AB3-AUD-ALL"},
    {d: 6, s: "t", p: 9, f: "BCSE201L-Object Oriented Programming-TH-AB3-202-ALL"},
    
    // Sunday (d: 7) - Free day
  ]
};

// Additional friend for testing multiple schedules
const friend2Timetable = {
  u: "sarah_coder",
  t: "2025-06-13T05:07:30+00:00",
  o: [
    // Monday (d: 1)
    {d: 1, s: "t", p: 4, f: "BCSE501L-Advanced Algorithms-TH-AB3-504-ALL"},
    {d: 1, s: "t", p: 7, f: "BCSE502L-Computer Graphics-TH-AB3-505-ALL"},
    {d: 1, s: "t", p: 10, f: "BCSE503L-Artificial Intelligence-TH-AB3-506-ALL"},
    
    // Tuesday (d: 2)
    {d: 2, s: "l", p: 3, f: "L15-BCSE502P-Graphics Lab-LO-AB3-515-ALL"},
    {d: 2, s: "l", p: 4, f: "L16-BCSE502P-Graphics Lab-LO-AB3-515-ALL"},
    {d: 2, s: "t", p: 9, f: "BCSE501L-Advanced Algorithms-TH-AB3-504-ALL"},
    {d: 2, s: "t", p: 12, f: "BHUM201L-Management Principles-TH-AB3-203-ALL"},
    
    // Wednesday (d: 3)
    {d: 3, s: "t", p: 1, f: "BCSE503L-Artificial Intelligence-TH-AB3-506-ALL"},
    {d: 3, s: "t", p: 3, f: "BCSE502L-Computer Graphics-TH-AB3-505-ALL"},
    {d: 3, s: "t", p: 7, f: "BCSE504L-Cyber Security-TH-AB3-507-ALL"},
    {d: 3, s: "t", p: 12, f: "BCSE999L-Research Methodology-TH-AB3-AUD-ALL"},
    
    // Thursday (d: 4)
    {d: 4, s: "l", p: 5, f: "L17-BCSE503P-AI Lab-LO-AB3-516-ALL"},
    {d: 4, s: "l", p: 6, f: "L18-BCSE503P-AI Lab-LO-AB3-516-ALL"},
    {d: 4, s: "t", p: 11, f: "BCSE504L-Cyber Security-TH-AB3-507-ALL"},
    {d: 4, s: "t", p: 12, f: "BHUM201L-Management Principles-TH-AB3-203-ALL"},
    
    // Friday (d: 5)
    {d: 5, s: "t", p: 1, f: "BCSE501L-Advanced Algorithms-TH-AB3-504-ALL"},
    {d: 5, s: "t", p: 3, f: "BCSE503L-Artificial Intelligence-TH-AB3-506-ALL"},
    {d: 5, s: "l", p: 8, f: "L19-BCSE504P-Security Lab-LO-AB3-517-ALL"},
    {d: 5, s: "l", p: 9, f: "L20-BCSE504P-Security Lab-LO-AB3-517-ALL"},
    
    // Saturday (d: 6)
    {d: 6, s: "t", p: 2, f: "BCSE502L-Computer Graphics-TH-AB3-505-ALL"},
    {d: 6, s: "t", p: 10, f: "BCSE999L-Industry Talk-TH-AB3-AUD-ALL"},
    
    // Sunday (d: 7) - Free day
  ]
};

// Types for better type safety
interface ConflictResult {
  day: number;
  user1_class: string;
  user1_time: string;
  user2_class: string;
  user2_time: string;
}

interface FreeTimeResult {
  day: number;
  start_time: string;
  end_time: string;
}

// Helper function: Day number to name
function getDayName(day: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[day - 1];
}

const TimetableComponent: React.FC = () => {
  // State management
  const [conflicts, setConflicts] = useState<ConflictResult[]>([]);
  const [freeTimes, setFreeTimes] = useState<FreeTimeResult[]>([]);
  const [isFreeNow, setIsFreeNow] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('conflicts');
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Initialize component - check for current availability on mount
  useEffect(() => {
    const initializeAvailability = async () => {
      try {
        const today = new Date().getDay() || 7; // Convert Sunday from 0 to 7
        const currentTimeStr = new Date().toTimeString().substring(0, 5); // HH:MM format
        
        const result = await isUserFreeAt(userTimetable, today, currentTimeStr);
        setIsFreeNow(result);
      } catch (error) {
        console.error("Error initializing availability:", error);
        setError("Failed to check initial availability");
      }
    };

    initializeAvailability();
  }, []); // Empty dependency array - runs once on mount

  // Automatically check availability every 5 minutes
  useEffect(() => {
    const checkAvailabilityPeriodically = async () => {
      try {
        const today = new Date().getDay() || 7;
        const currentTimeStr = new Date().toTimeString().substring(0, 5);
        
        const result = await isUserFreeAt(userTimetable, today, currentTimeStr);
        setIsFreeNow(result);
      } catch (error) {
        console.error("Error in periodic availability check:", error);
      }
    };

    const timer = setInterval(checkAvailabilityPeriodically, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(timer);
  }, []); // Empty dependency array

  // Memoized function to check conflicts
  const handleCheckConflicts = useCallback(async () => {
    setLoading(true);
    setActiveTab('conflicts');
    setError(null);
    
    try {
      const result = await checkConflicts(userTimetable, friendTimetable);
      setConflicts(result);
      console.log('Conflicts found:', result);
    } catch (error) {
      console.error("Error checking conflicts:", error);
      setError("Failed to check conflicts. Please try again.");
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized function to find common free times
  const handleFindFreeTimes = useCallback(async () => {
    setLoading(true);
    setActiveTab('freeTimes');
    setError(null);
    
    try {
      const result = await findCommonFreeTimes([userTimetable, friendTimetable]);
      setFreeTimes(result);
      console.log('Free times found:', result);
    } catch (error) {
      console.error("Error finding free times:", error);
      setError("Failed to find free times. Please try again.");
      setFreeTimes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized function to check if user is free now
  const handleCheckIfFreeNow = useCallback(async () => {
    setLoading(true);
    setActiveTab('availability');
    setError(null);
    
    try {
      const today = new Date().getDay() || 7; // Convert Sunday from 0 to 7
      const currentTimeStr = new Date().toTimeString().substring(0, 5); // HH:MM format
      
      console.log('Checking availability for:', { today, currentTimeStr });
      
      const result = await isUserFreeAt(userTimetable, today, currentTimeStr);
      setIsFreeNow(result);
    } catch (error) {
      console.error("Error checking if user is free:", error);
      setError("Failed to check availability. Please try again.");
      setIsFreeNow(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load conflicts and free times on component mount
  useEffect(() => {
    const autoLoadData = async () => {
      try {
        // Load conflicts
        const conflictResults = await checkConflicts(userTimetable, friendTimetable);
        setConflicts(conflictResults);

        // Load free times
        const freeTimeResults = await findCommonFreeTimes([userTimetable, friendTimetable]);
        setFreeTimes(freeTimeResults);
      } catch (error) {
        console.error("Error auto-loading data:", error);
        setError("Failed to load initial data");
      }
    };

    autoLoadData();
  }, []); // Empty dependency array - runs once on mount

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Timetable Comparison</h1>
      
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setError(null)}
                  className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">{userTimetable.u.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">{userTimetable.u}</h3>
              <p className="text-sm text-gray-500">Your Schedule</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Classes: <span className="font-medium">{userTimetable.o.length}</span></p>
            <p className="mt-1">Last Updated: <span className="font-medium">{new Date(userTimetable.t).toLocaleString()}</span></p>
            <p className="mt-1">Status: 
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isFreeNow === true ? 'bg-green-100 text-green-800' : 
                isFreeNow === false ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {isFreeNow === true ? 'Free' : isFreeNow === false ? 'Busy' : 'Unknown'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-xl">{friendTimetable.u.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">{friendTimetable.u}</h3>
              <p className="text-sm text-gray-500">Friend's Schedule</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Classes: <span className="font-medium">{friendTimetable.o.length}</span></p>
            <p className="mt-1">Last Updated: <span className="font-medium">{new Date(friendTimetable.t).toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button 
          onClick={handleCheckConflicts}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading && activeTab === 'conflicts' ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            `Check Conflicts ${conflicts.length > 0 ? `(${conflicts.length})` : ''}`
          )}
        </button>
        
        <button 
          onClick={handleFindFreeTimes}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {loading && activeTab === 'freeTimes' ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Finding...
            </span>
          ) : (
            `Find Free Times ${freeTimes.length > 0 ? `(${freeTimes.length})` : ''}`
          )}
        </button>
        
        <button 
          onClick={handleCheckIfFreeNow}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading && activeTab === 'availability' ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            'Refresh Availability'
          )}
        </button>
      </div>

      {/* Results section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('conflicts')} 
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === 'conflicts' 
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Conflicts {conflicts.length > 0 && `(${conflicts.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('freeTimes')} 
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === 'freeTimes' 
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Free Times {freeTimes.length > 0 && `(${freeTimes.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('availability')} 
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === 'availability' 
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Availability
          </button>
        </div>
        
        <div className="p-4">
          {activeTab === 'conflicts' && (
            <>
              {loading && activeTab === 'conflicts' ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">Loading conflicts...</p>
                </div>
              ) : conflicts.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Conflicts ({conflicts.length})</h3>
                  <ul className="space-y-3">
                    {conflicts.map((conflict, index) => (
                      <li key={index} className="p-3 bg-red-50 rounded-md border border-red-100">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              <span className="font-semibold">{getDayName(conflict.day)}:</span> {conflict.user1_class}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {userTimetable.u}: {conflict.user1_time} | {friendTimetable.u}: {conflict.user2_time}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conflicts found</h3>
                  <p className="mt-1 text-sm text-gray-500">Your schedules don't have any overlapping classes.</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'freeTimes' && (
            <>
              {loading && activeTab === 'freeTimes' ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">Finding free times...</p>
                </div>
              ) : freeTimes.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Free Times ({freeTimes.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {freeTimes.map((time, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-md border border-green-100">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{getDayName(time.day)}</p>
                            <p className="text-xs text-gray-500 mt-1">{time.start_time} - {time.end_time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No free times found</h3>
                  <p className="mt-1 text-sm text-gray-500">You and your friend don't have any common free time slots.</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'availability' && (
            <>
              {loading && activeTab === 'availability' ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">Checking availability...</p>
                </div>
              ) : isFreeNow !== null ? (
                <div className="py-6">
                  <div className={`p-4 rounded-lg ${isFreeNow ? 'bg-green-50' : 'bg-red-50'} flex items-center`}>
                    {isFreeNow ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                          <svg className="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">You're Free Right Now!</h4>
                          <p className="text-sm text-gray-600 mt-1">You don't have any classes scheduled at the moment.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                          <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">You're Busy Right Now</h4>
                          <p className="text-sm text-gray-600 mt-1">You have a class scheduled at the moment.</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Current time info */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Current time: <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Today: <span className="font-medium">{getDayName(currentTime.getDay() || 7)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Auto-updates every 5 minutes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Availability not checked</h3>
                  <p className="mt-1 text-sm text-gray-500">Click "Refresh Availability" to check if you're free.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Timetable Comparison Tool</p>
        <p className="mt-1">Current time: {currentTime.toLocaleString()}</p>
        <p className="mt-1">Last data refresh: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default TimetableComponent;