import React from 'react';
import AssetHistoryTimeline from './AssetHistoryTimeline';

const AssetDetail = () => {
  return (
    <>
      {/* Slide-out Panel Overlay */}
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm z-40 transition-opacity"></div>

      {/* Detail Panel */}
      <div className="absolute top-0 right-0 h-full w-[600px] bg-surface-card shadow-2xl border-l border-outline-variant z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Panel Header */}
        <div className="flex justify-between items-start p-spacing-lg border-b border-outline-variant bg-surface-container-lowest">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-headline-md text-headline-md text-on-surface">MacBook Pro 16"</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-caps text-label-caps bg-info-assigned/10 text-info-assigned border border-info-assigned/20">
                ASSIGNED
              </span>
            </div>
            <div className="font-data-mono text-data-mono text-text-body">
              SN: C02X1234ABCD
            </div>
          </div>
          <button aria-label="Close panel" className="p-2 text-outline hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Panel Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-spacing-lg space-y-spacing-xl bg-surface-page">
          {/* Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-gutter">
            <div className="bg-surface-card p-spacing-md rounded-lg shadow-sm border border-outline-variant">
              <div className="text-text-body font-label-caps text-label-caps mb-2">PURCHASE DATE</div>
              <div className="font-headline-sm text-headline-sm text-on-surface">Jan 12, 2023</div>
            </div>
            <div className="bg-surface-card p-spacing-md rounded-lg shadow-sm border border-outline-variant">
              <div className="text-text-body font-label-caps text-label-caps mb-2">WARRANTY EXP</div>
              <div className="font-headline-sm text-headline-sm text-on-surface">Jan 12, 2026</div>
            </div>
            <div className="bg-surface-card p-spacing-md rounded-lg shadow-sm border border-outline-variant">
              <div className="text-text-body font-label-caps text-label-caps mb-2">BATTERY HEALTH</div>
              <div className="font-headline-sm text-headline-sm text-success-available flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">battery_charging_full</span>
                98%
              </div>
            </div>
          </div>

          {/* Allocation History Timeline */}
          <AssetHistoryTimeline />

          {/* Action Section */}
          <div className="bg-surface-card rounded-lg shadow-sm border border-outline-variant p-spacing-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-spacing-md border-b border-outline-variant pb-2">Actions</h3>
            <form className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">REASSIGN ASSET</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person_search</span>
                  <select defaultValue="" className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface appearance-none cursor-pointer">
                    <option disabled value="">Search user...</option>
                    <option value="1">Jane Doe (Design)</option>
                    <option value="2">John Smith (Engineering)</option>
                    <option value="3">Alice Johnson (Marketing)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">REPORT CONDITION</label>
                <textarea className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface resize-none" placeholder="Note any scratches, dents, or operational issues..." rows="3"></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-md text-body-md font-medium hover:bg-surface-tint transition-colors flex items-center gap-2" type="button">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Update Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetDetail;
