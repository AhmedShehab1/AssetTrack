export default function TopNav() {
  return (
    <header className="flex justify-between items-center w-full px-6 h-16 top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-inter text-sm antialiased sticky">
      <div className="flex-1 flex items-center">
        <div className="relative w-64 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: "20px" }}>search</span>
          <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm" placeholder="Global search..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <button className="text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80">
          <span className="material-symbols-outlined" data-icon="help">help</span>
        </button>
        <button className="text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
        </button>
        <div className="h-8 w-8 rounded-full bg-indigo-100 overflow-hidden border border-slate-200 ml-2">
          <img alt="User Profile Avatar" className="w-full h-full object-cover" data-alt="Default user avatar with blue background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYx2iFkZQ5Fn5UhJviIMgu6H-M1nP311rXmmiYbKjI_73lBpwZEziUVGY8g-KClDQrjeCBj_VP7PAyOsT0x0y7zqL3t0zhpSsbqXpiQX4YdJ35RUSYN14u5Zrm9NWyWnr0rdnHM5EwmT0BV800SsK1AkgSykIdEkxc5zjO9aUc9qMXThawE1iOADY-rImhP5PBrOvsNPetLcMMmqscUdLS9Qp6MqEOQWGDhsu8w4l7moIImyJJBDp7XHn89-9ScmNnNNOdJoEXLKW_" />
        </div>
      </div>
    </header>
  );
}