import './App.css'
import AIInterview from './components/RecordScreen'
import InterviewDashboard from './components/Dashboard'
import { useState } from 'react';



function App() {

  const [selectedComponent, setSelectedComponent] = useState("AIInterview");

  return <>
  <header className="border-b border-white/10 bg-[#0b0d10] shadow-md">
      <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-3">
        <div className="text-sm font-semibold tracking-tight text-white/90">
          AI Live Simulation
        </div>
        <button
          className="ml-auto text-sm text-white/70 hover:text-white"
          onClick={() => setSelectedComponent(selectedComponent === "AIInterview" ? "InterviewDashboard" : "AIInterview")}
        >
          {selectedComponent === "AIInterview" ? "View Dashboard" : "Back to Simulation"}
        </button>
      </div>
    </header>  {selectedComponent === "AIInterview" ? (
    <AIInterview />
  ) : (
    <InterviewDashboard />
  )}
  
  </>
}

export default App
