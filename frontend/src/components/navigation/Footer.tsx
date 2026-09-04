import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto py-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="font-bold text-text text-base">SchoolFund</span>
            </div>
            <p className="text-xs text-text-muted max-w-sm">
              Simple, transparent contribution and expense coordination for student communities in Lagos, Nigeria.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <span>Infrastructure by</span>
              <a
                href="https://bkey.mintlify.app/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-text hover:text-accent flex items-center gap-0.5"
              >
                BMONI Embedded <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <span>•</span>
            <span>Zero WhatsApp chaos</span>
            <span>•</span>
            <span>Lagos, Nigeria</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-text-subtle gap-3">
          <p>© 2026 SchoolFund Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-text cursor-pointer">Security Policy</span>
            <span className="hover:text-text cursor-pointer">Privacy Notice</span>
            <span className="hover:text-text cursor-pointer">API Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
