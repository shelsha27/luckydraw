
import React, { useState, useMemo } from 'react';
import { Participant } from '../types';

interface ListManagerProps {
  participants: Participant[];
  onUpdate: (newList: string[]) => void;
}

const MOCK_DATA = [
  "王小明", "李小華", "陳大文", "張曉芬", "林志玲", 
  "周杰倫", "蔡依林", "郭台銘", "徐若瑄", "金城武",
  "劉德華", "梁朝偉", "周星馳", "成龍", "甄子丹"
];

const ListManager: React.FC<ListManagerProps> = ({ participants, onUpdate }) => {
  const [inputText, setInputText] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split(/\r?\n/).map(line => {
        return line.split(',')[0].trim();
      }).filter(Boolean);
      onUpdate(lines);
      setInputText(lines.join('\n'));
    };
    reader.readAsText(file);
  };

  const handleManualUpdate = () => {
    const lines = inputText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    onUpdate(lines);
  };

  const loadMockData = () => {
    setInputText(MOCK_DATA.join('\n'));
    onUpdate(MOCK_DATA);
  };

  const duplicatesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return Object.values(counts).filter(count => count > 1).length;
  }, [participants]);

  const removeDuplicates = () => {
    const uniqueNames = Array.from(new Set(participants.map(p => p.name)));
    onUpdate(uniqueNames);
    setInputText(uniqueNames.join('\n'));
  };

  const isDuplicate = (name: string) => {
    return participants.filter(p => p.name === name).length > 1;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-user-plus text-indigo-600 mr-2"></i>
            匯入名單
          </h2>
          <button 
            onClick={loadMockData}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium px-3 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors"
          >
            <i className="fas fa-vial mr-1"></i>載入模擬名單
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上傳 CSV / TXT 檔案
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors cursor-pointer relative">
            <div className="space-y-1 text-center">
              <i className="fas fa-file-csv text-4xl text-gray-400 mb-3"></i>
              <div className="flex text-sm text-gray-600">
                <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  點擊上傳檔案
                </span>
                <p className="pl-1">或拖放至此</p>
              </div>
              <p className="text-xs text-gray-500">支援 .csv, .txt</p>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept=".csv,.txt"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            或直接貼上姓名名單 (一行一個)
          </label>
          <textarea
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none font-mono text-sm"
            placeholder="王小明&#10;李小華&#10;陳大文..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          <button
            onClick={handleManualUpdate}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            更新名單
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-users text-indigo-600 mr-2"></i>
              目前名單 ({participants.length} 人)
            </h2>
            {duplicatesCount > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                <i className="fas fa-exclamation-circle mr-1"></i>
                偵測到重複姓名
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            {participants.length > 0 && (
              <button 
                onClick={() => { setInputText(''); onUpdate([]); }}
                className="text-gray-400 hover:text-red-500 text-xs font-medium"
              >
                <i className="fas fa-trash-alt mr-1"></i>清空名單
              </button>
            )}
            {duplicatesCount > 0 && (
              <button 
                onClick={removeDuplicates}
                className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <i className="fas fa-broom mr-1"></i>移除重複項
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto max-h-[500px] border border-gray-50 rounded-xl bg-gray-50 p-4">
          {participants.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              {participants.map((p, idx) => {
                const dup = isDuplicate(p.name);
                return (
                  <div 
                    key={p.id} 
                    className={`px-3 py-2 rounded-lg border text-sm shadow-sm flex items-center justify-between ${
                      dup ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center truncate">
                      <span className={`mr-2 font-bold tabular-nums ${dup ? 'text-amber-400' : 'text-indigo-400'}`}>
                        {idx + 1}.
                      </span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    {dup && <i className="fas fa-copy text-[10px] text-amber-400 ml-2 shrink-0"></i>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-20">
              <i className="fas fa-ghost text-4xl mb-2"></i>
              <p>目前還沒有任何成員</p>
              <p className="text-sm text-gray-300">請從左側匯入或載入模擬名單</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListManager;
