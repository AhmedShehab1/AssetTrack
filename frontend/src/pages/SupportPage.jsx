import React from 'react';
import { HelpCircle, Mail, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const SupportPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-text-heading flex items-center gap-3">
          <HelpCircle size={32} className="text-primary" />
          System Support
        </h1>
        <p className="text-text-body mt-2 font-medium">Get help with asset management, report system bugs, or request assistance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Methods */}
        <Card padding="p-8" className="space-y-6">
          <div className="flex items-center gap-2.5 text-primary border-b border-outline-variant pb-4">
            <Mail size={20} />
            <h3 className="font-extrabold uppercase tracking-widest text-xs">Technical Support</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-body leading-relaxed">
              If you're experiencing technical issues with the AssetTrack platform, please contact our IT helpdesk.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-outline-variant">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Support Email</p>
              <p className="text-sm font-bold text-text-heading">it-support@assettrack.internal</p>
            </div>
            <Button variant="primary" className="w-full" icon={Mail}>Open Support Ticket</Button>
          </div>
        </Card>

        {/* Documentation */}
        <Card padding="p-8" className="space-y-6">
          <div className="flex items-center gap-2.5 text-primary border-b border-outline-variant pb-4">
            <ShieldCheck size={20} />
            <h3 className="font-extrabold uppercase tracking-widest text-xs">Guidelines</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-body leading-relaxed">
              Review organizational policies regarding hardware care, allocation periods, and lost/stolen device reporting.
            </p>
            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-bold text-text-heading hover:bg-slate-100 transition-all border border-outline-variant">
                Device Care Policy <ExternalLink size={14} />
              </a>
              <a href="#" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-bold text-text-heading hover:bg-slate-100 transition-all border border-outline-variant">
                Software Install Guidelines <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQs */}
      <Card padding="p-8" className="space-y-6">
        <h3 className="text-lg font-bold text-text-heading">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <div className="space-y-2 border-l-4 border-primary-light pl-4">
            <p className="text-sm font-bold text-text-heading">How do I request a replacement laptop?</p>
            <p className="text-sm text-text-body">Go to the Dashboard and use the "Find Available Spare Laptop" action, or contact your manager directly.</p>
          </div>
          <div className="space-y-2 border-l-4 border-primary-light pl-4">
            <p className="text-sm font-bold text-text-heading">My asset is broken. What should I do?</p>
            <p className="text-sm text-text-body">Find your asset in the "Assets" list or on your profile and click "Report Issue" to submit a condition report.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupportPage;
