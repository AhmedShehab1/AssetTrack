import React from 'react';

const AssetHistoryTimeline = () => {
  return (
    <div className="bg-surface-card rounded-lg shadow-sm border border-outline-variant p-spacing-lg">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-spacing-md">Allocation History</h3>
      <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-outline-variant">
        {/* Current Assignment */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-surface-card absolute left-0 -translate-x-1.5 shadow">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
          <div className="w-full ml-4">
            <div className="flex flex-col p-4 bg-primary-fixed/30 border border-primary-fixed-dim rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <div className="font-body-lg text-body-lg font-semibold text-on-surface">Sarah Chen</div>
                <span className="font-label-caps text-label-caps text-primary">CURRENT</span>
              </div>
              <div className="font-body-md text-body-md text-text-body mb-2">Developer</div>
              <div className="font-data-mono text-data-mono text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                March 2024 - Present
              </div>
            </div>
          </div>
        </div>
        {/* Previous Assignment */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-outline-variant bg-surface-card absolute left-0 -translate-x-1.5 shadow">
          </div>
          <div className="w-full ml-4">
            <div className="flex flex-col p-4 bg-surface-container-low border border-outline-variant rounded-lg">
              <div className="font-body-lg text-body-lg font-medium text-on-surface mb-1">Mike Ross</div>
              <div className="font-body-md text-body-md text-text-body mb-2">Manager</div>
              <div className="font-data-mono text-data-mono text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">history</span>
                Jan 2023 - March 2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetHistoryTimeline;
