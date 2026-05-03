import AssetDetail from './AssetDetail';

export default function AssetList() {
  return (
    <main className="flex-1 p-container-padding overflow-x-hidden">
      <div className="flex justify-between items-end mb-spacing-lg">
        <div>
          <h2 className="font-headline-md text-text-heading">Asset Master List</h2>
          <p className="font-body-md text-text-body mt-1">Manage and track all organizational hardware assets.</p>
        </div>
        <button className="bg-surface-card border border-outline-variant text-on-surface hover:bg-surface-container-low font-body-md py-2 px-4 rounded flex items-center gap-2 transition-colors shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>
          Export CSV
        </button>
      </div>

      {/* Advanced Search / Filters */}
      <div className="bg-surface-card rounded-lg shadow-sm border border-surface-dim p-spacing-md mb-spacing-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="col-span-1 md:col-span-1">
            <label className="block font-label-caps text-on-surface-variant mb-2">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: "18px" }}>search</span>
              <input className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Search ID, Serial, Model..." type="text" />
            </div>
          </div>
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Brand</label>
            <select className="w-full px-3 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-colors">
              <option value="">All Brands</option>
              <option value="apple">Apple</option>
              <option value="dell">Dell</option>
              <option value="lenovo">Lenovo</option>
              <option value="hp">HP</option>
            </select>
          </div>
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Status</label>
            <select className="w-full px-3 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-colors">
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">User</label>
            <select className="w-full px-3 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-colors">
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
              <option value="active">Active Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-card rounded-lg shadow-sm border border-surface-dim overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-surface-container-low border-b border-surface-dim sticky top-0">
              <tr>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold w-12 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                </th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold">Asset ID</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold">Type</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold">Brand &amp; Model</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold">Serial Number</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold">Status</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold">Assigned To</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim">
              {/* Row 1: Assigned */}
              <tr className="hover:bg-surface-container-lowest/50 transition-colors group">
                <td className="py-4 px-4 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                </td>
                <td className="py-4 px-4 font-data-mono text-on-surface-variant">AST-1042</td>
                <td className="py-4 px-4 font-body-md text-on-surface">Laptop</td>
                <td className="py-4 px-4 font-body-md text-on-surface">
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-heading">Apple</span>
                    <span className="text-on-surface-variant text-sm">MacBook Pro 16"</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-data-mono text-on-surface-variant">C02DG548MD6R</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 bg-info-assigned/10 text-info-assigned font-label-caps px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-info-assigned"></span>
                    Assigned
                  </span>
                </td>
                <td className="py-4 px-4 font-body-md text-on-surface flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-dim overflow-hidden flex-shrink-0">
                    <img alt="Sarah Connor avatar" className="w-full h-full object-cover" data-alt="Small round user avatar with initials SC" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLmNI0QTkwQU1dwv4WU2aYXVfoG_yfhTEvcerECH4TW95diTG7Vc1waCgRW83cAtmv0ocpvM99Nd_IWlJvN0_wT5UwXoR8Sif_Kp9up-U6SvFHWnc_ps4oVD5OptatYqux_0ueVN_pbufulRusDehhjmryjoGB2471e4z8FkSqBzkBKpsZJsLPfKLxKawoh8On7BzygWIN1zafZGlNuDQXs5tL-ajNw8huYxuZdM1eDZeM12PkZbJg3NeT73Bp2cXt80EjllT0cp76" />
                  </div>
                  Sarah Connor
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Row 2: Available */}
              <tr className="hover:bg-surface-container-lowest/50 transition-colors group">
                <td className="py-4 px-4 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                </td>
                <td className="py-4 px-4 font-data-mono text-on-surface-variant">AST-1089</td>
                <td className="py-4 px-4 font-body-md text-on-surface">Monitor</td>
                <td className="py-4 px-4 font-body-md text-on-surface">
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-heading">Dell</span>
                    <span className="text-on-surface-variant text-sm">UltraSharp 27" 4K</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-data-mono text-on-surface-variant">CN-0YXD9-74261</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 bg-success-available/10 text-success-available font-label-caps px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-available"></span>
                    Available
                  </span>
                </td>
                <td className="py-4 px-4 font-body-md text-on-surface-variant italic">
                  --
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Row 3: Decommissioned */}
              <tr className="hover:bg-surface-container-lowest/50 transition-colors group bg-surface-container-lowest/30">
                <td className="py-4 px-4 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                </td>
                <td className="py-4 px-4 font-data-mono text-outline-variant">AST-0852</td>
                <td className="py-4 px-4 font-body-md text-on-surface-variant">Laptop</td>
                <td className="py-4 px-4 font-body-md text-on-surface-variant">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface-variant">Lenovo</span>
                    <span className="text-outline text-sm">ThinkPad T480</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-data-mono text-outline-variant">PF123456</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 bg-danger-expired/10 text-danger-expired font-label-caps px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger-expired"></span>
                    Decommissioned
                  </span>
                </td>
                <td className="py-4 px-4 font-body-md text-on-surface-variant italic">
                  --
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Row 4: Assigned */}
              <tr className="hover:bg-surface-container-lowest/50 transition-colors group">
                <td className="py-4 px-4 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                </td>
                <td className="py-4 px-4 font-data-mono text-on-surface-variant">AST-1105</td>
                <td className="py-4 px-4 font-body-md text-on-surface">Tablet</td>
                <td className="py-4 px-4 font-body-md text-on-surface">
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-heading">Apple</span>
                    <span className="text-on-surface-variant text-sm">iPad Pro 12.9"</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-data-mono text-on-surface-variant">DMPFG234Q16Q</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 bg-info-assigned/10 text-info-assigned font-label-caps px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-info-assigned"></span>
                    Assigned
                  </span>
                </td>
                <td className="py-4 px-4 font-body-md text-on-surface flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-dim overflow-hidden flex-shrink-0">
                    <img alt="John Doe avatar" className="w-full h-full object-cover" data-alt="Small round user avatar with initials JD" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEFaDoGuBE0sCRh3_80HwI2OHRslE9msiEVhrHZ8jZFkHNwNGN32d9IsBbLRpcCn-CSUyA5y3vQRhOFf8Qyj12y_9B-MzX4wnng7kpX_clsDYXm8rBF8OaHUqD8bEMKheKjVOt4YDSzvqKJ6mCDHy5e5ryL15vXH0I8OC7t7Q0QVbXf3B_pEuKDba1VwZcpA-ubzqJ1mADdr4YHD-P1alkvc-9I1PX7sm6CCBVQVXwR7I1NLUubdGoKmTcQ_ghAgUoMIo4cIK65VHW" />
                  </div>
                  John Doe
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-surface border-t border-surface-dim px-4 py-3 flex items-center justify-between">
          <span className="font-body-md text-on-surface-variant text-sm">Showing 1 to 4 of 1,248 assets</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50" disabled>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_left</span>
            </button>
            <button className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      <AssetDetail />
    </main>
  );
}