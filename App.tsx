
import React, { useState, useCallback } from 'react';
import { AppTab, Participant } from './types';
import ListManager from './components/ListManager';
import LuckyDraw from './components/LuckyDraw';
import GroupingTool from './components/GroupingTool';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LIST);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleUpdateParticipants = useCallback((newList: string[]) => {
    const formatted: Participant[] = newList
      .filter(name => name.trim() !== '')
      .map((name, index) => ({
        id: `${Date.now()}-${index}`,
        name: name.trim()
      }));
    setParticipants(formatted);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg text-indigo-700">
              <i className="fas fa-users-cog text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HR 智慧工具箱</h1>
              <p className="text-indigo-200 text-sm">抽獎 · 分組 · 名單管理</p>
            </div>
          </div>
          
          <nav className="flex bg-indigo-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab(AppTab.LIST)}
              className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === AppTab.LIST ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <i className="fas fa-list-ul mr-2"></i>名單
            </button>
            <button
              onClick={() => setActiveTab(AppTab.LUCKY_DRAW)}
              className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === AppTab.LUCKY_DRAW ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <i className="fas fa-gift mr-2"></i>抽獎
            </button>
            <button
              onClick={() => setActiveTab(AppTab.GROUPING)}
              className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === AppTab.GROUPING ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <i className="fas fa-layer-group mr-2"></i>分組
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {participants.length === 0 && activeTab !== AppTab.LIST && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-amber-500 mr-3"></i>
              <p className="text-amber-700">
                尚未設定參加者名單！請先至「名單」分頁新增或上傳名單。
              </p>
            </div>
          </div>
        )}

        <div className="transition-all duration-300">
          {activeTab === AppTab.LIST && (
            <ListManager 
              participants={participants} 
              onUpdate={handleUpdateParticipants} 
            />
          )}
          {activeTab === AppTab.LUCKY_DRAW && (
            <LuckyDraw participants={participants} />
          )}
          {activeTab === AppTab.GROUPING && (
            <GroupingTool participants={participants} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} HR Suite - 您的活動好幫手
        </div>
      </footer>
    </div>
  );
};

export default App;
