export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col py-6 font-inter text-[13px] font-medium z-50">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-black text-indigo-600 dark:text-indigo-400">AssetTrack</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Enterprise Asset Mgmt</p>
      </div>
      <div className="px-4 mb-6">
        <button className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
          Add New Asset
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          Dashboard
        </a>
        <a className="flex items-center gap-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 px-4 py-3 shadow-sm transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="inventory_2" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
          Assets
        </a>
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="history_edu">history_edu</span>
          Allocation
        </a>
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          Users
        </a>
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          Settings
        </a>
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-4">
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="contact_support">contact_support</span>
          Support
        </a>
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          Logout
        </a>
      </div>
    </aside>
  );
}