import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Zap, Laptop, Truck } from 'lucide-react';

const QuickActions = ({ navigate, role }) => (
  <Card>
    <div className="flex items-center gap-2.5 mb-3">
      <Zap size={20} className="text-primary fill-primary" />
      <h3 className="text-lg font-bold text-text-heading">Quick Actions</h3>
    </div>
    <p className="text-text-body text-sm leading-relaxed mb-8">Instantly locate hardware for new hires or immediate replacements.</p>
    <div className="flex flex-col gap-4">
      <Button variant="primary" icon={Laptop} className="w-full !justify-start" onClick={() => navigate('/spare-laptops')}>
        Find Available Spare Laptop
      </Button>
      {role === 'ADMIN' && (
        <Button variant="outline" icon={Truck} className="w-full !justify-start" onClick={() => navigate('/assets/register')}>
          Log New Delivery
        </Button>
      )}
    </div>
  </Card>
);

export default QuickActions;
