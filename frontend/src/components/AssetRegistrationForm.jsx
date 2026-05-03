import React from 'react';

export default function AssetRegistrationForm() {
  return (
    <main className="flex-1 overflow-y-auto p-container-padding flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-spacing-lg">
          <h2 className="font-headline-md text-headline-md text-text-heading">Register New Asset</h2>
          <p className="font-body-md text-body-md text-text-body mt-1">Enter the details for the new asset to add it to the registry.</p>
        </div>
        <div className="bg-surface-card rounded-lg shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] border border-slate-200 overflow-hidden">
          <form className="p-spacing-lg space-y-spacing-lg">
            {/* Core Details Grid */}
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-heading mb-spacing-md border-b border-slate-100 pb-2">Hardware Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md">
                <div>
                  <label className="block font-label-caps text-label-caps text-text-heading mb-2">Asset Type</label>
                  <div className="relative">
                    <select defaultValue="" className="w-full appearance-none bg-white border border-outline-variant rounded-DEFAULT py-2 pl-3 pr-10 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                      <option disabled value="">Select type</option>
                      <option value="laptop">Laptop</option>
                      <option value="monitor">Monitor</option>
                      <option value="desktop">Desktop</option>
                      <option value="phone">Mobile Phone</option>
                      <option value="tablet">Tablet</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-text-heading mb-2">Brand</label>
                  <input className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400" placeholder="e.g. Dell, Apple" type="text"/>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-text-heading mb-2">Model</label>
                  <input className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400" placeholder="e.g. Latitude 7420" type="text"/>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-text-heading mb-2">Serial Number</label>
                  <input className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-data-mono text-data-mono text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400" placeholder="Enter serial/service tag" type="text"/>
                </div>
              </div>
            </div>
            {/* Lifecycle Grid */}
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-heading mb-spacing-md border-b border-slate-100 pb-2">Lifecycle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md">
                <div>
                  <label className="block font-label-caps text-label-caps text-text-heading mb-2">Purchase Date</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
                    <input className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 pl-10 pr-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-600" type="date"/>
                  </div>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-text-heading mb-2">Warranty Expiration</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">verified_user</span>
                    <input className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 pl-10 pr-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-600" type="date"/>
                  </div>
                </div>
              </div>
            </div>
            {/* Notes Section */}
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-heading mb-spacing-md border-b border-slate-100 pb-2">Additional Details</h3>
              <div>
                <label className="block font-label-caps text-label-caps text-text-heading mb-2">Condition Notes (Optional)</label>
                <textarea className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 resize-none" placeholder="Note any existing damage, included accessories, or special configurations..." rows="4"></textarea>
              </div>
            </div>
          </form>
          {/* Action Footer */}
          <div className="bg-slate-50 border-t border-slate-200 p-spacing-md flex justify-end gap-3">
            <button className="px-4 py-2 font-body-md text-body-md font-medium text-slate-600 bg-white border border-slate-300 rounded-DEFAULT hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors" type="button">
              Cancel
            </button>
            <button className="px-6 py-2 font-body-md text-body-md font-medium text-white bg-primary rounded-DEFAULT hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors flex items-center gap-2" type="submit">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
              Save Asset
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
