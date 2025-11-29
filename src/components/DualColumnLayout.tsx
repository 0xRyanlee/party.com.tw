'use client';

import { useState } from 'react';

interface DualColumnLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  onBackgroundClick?: () => void;
}

export default function DualColumnLayout({
  leftPanel,
  rightPanel,
  onBackgroundClick,
}: DualColumnLayoutProps) {
  const [showRightPanel, setShowRightPanel] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 flex-col border-r border-border overflow-y-auto">
        {leftPanel}
      </div>

      {/* Right Panel - Desktop */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col overflow-y-auto">
        {rightPanel}
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full flex flex-col">
        {!showRightPanel ? (
          <div className="flex-1 overflow-y-auto">{leftPanel}</div>
        ) : (
          <>
            {/* Mobile Right Panel Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <button
                onClick={() => setShowRightPanel(false)}
                className="p-2 hover:bg-surface rounded-lg transition-smooth"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-bold flex-1">活動詳情</h2>
            </div>

            {/* Mobile Right Panel Content */}
            <div className="flex-1 overflow-y-auto">{rightPanel}</div>
          </>
        )}
      </div>

      {/* Mobile Overlay */}
      {showRightPanel && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-40"
          onClick={() => {
            setShowRightPanel(false);
            onBackgroundClick?.();
          }}
        />
      )}
    </div>
  );
}
