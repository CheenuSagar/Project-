import React from 'react';
import Dashboard from './Dashboard';

export default function StudentPanel({
  timetable,
  settings,
  onAddClick,
  onEditClick,
  onLoadPreset,
  selectedSection,
  holidayNotice
}) {
  return (
    <div className="student-portal animate-fade-in">
      <Dashboard 
        timetable={timetable} 
        settings={settings}
        onAddClick={onAddClick}
        onEditClick={onEditClick}
        onLoadPreset={onLoadPreset}
        selectedSection={selectedSection}
        holidayNotice={holidayNotice}
      />
    </div>
  );
}

