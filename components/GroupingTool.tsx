
import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface GroupingToolProps {
  participants: Participant[];
}

const GroupingTool: React.FC<GroupingToolProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);

  const performGrouping = async () => {
    if (participants.length === 0) return;
    setIsGenerating(true);

    // Shuffle
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // Chunk
    const resultGroups: Group[] = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      resultGroups.push({
        id: `group-${i}-${Date.now()}`,
        name: `第 ${resultGroups.length + 1} 組`,
        members: shuffled.slice(i, i + groupSize).map(p => p.name)
      });
    }

    setGroups(resultGroups);
    setIsGenerating(false);

    // AI Enhancement: Generate fun group names
    try {
      setAiWorking(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I have ${resultGroups.length} groups of people for an HR team building event. 
        Please generate ${resultGroups.length} fun, professional, and energetic team names in Traditional Chinese. 
        Return as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const names = JSON.parse(text);
        if (Array.isArray(names)) {
          setGroups(prev => prev.map((g, idx) => ({
            ...g,
            name: names[idx] || g.name
          })));
        }
      }
    } catch (e) {
      console.error("AI Group Name generation failed:", e);
    } finally {
      setAiWorking(false);
    }
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;

    // Create CSV content
    const header = "組別名稱,成員姓名\n";
    const rows = groups.flatMap(group => 
      group.members.map(member => `"${group.name}","${member}"`)
    ).join("\n");
    
    const csvContent = "\uFEFF" + header + rows; // Add BOM for Excel Chinese characters
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <i className="fas fa-layer-group text-indigo-600 mr-2"></i>
          自動分組設定
        </h2>
        
        <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每組人數設定
            </label>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setGroupSize(Math.max(2, groupSize - 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600"
              >
                <i className="fas fa-minus"></i>
              </button>
              <input 
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                className="w-16 text-center text-xl font-bold border-none focus:ring-0 outline-none"
              />
              <button 
                onClick={() => setGroupSize(Math.min(participants.length, groupSize + 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">
              目前有 {participants.length} 位成員，將分成 {Math.ceil(participants.length / groupSize)} 組。
            </p>
            <button
              onClick={performGrouping}
              disabled={isGenerating || participants.length === 0}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? '分組中...' : '執行隨機分組'}
            </button>
          </div>
        </div>
      </div>

      {/* Visualized Results */}
      {groups.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-gray-800">分組結果</h3>
            {aiWorking && (
              <span className="flex items-center text-indigo-600 text-sm animate-pulse">
                <i className="fas fa-magic mr-2"></i>
                正在由 AI 構思組名...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, idx) => (
              <div 
                key={group.id} 
                className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                  <h4 className="font-bold truncate pr-2">{group.name}</h4>
                  <span className="bg-indigo-400 bg-opacity-40 text-xs px-2 py-1 rounded">
                    {group.members.length} 人
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {group.members.map((member, mIdx) => (
                    <div 
                      key={mIdx}
                      className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 group-hover:bg-indigo-50 transition-colors"
                    >
                      <i className="fas fa-user text-xs text-indigo-300 mr-3"></i>
                      <span className="font-medium">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 pt-8">
            <button 
              onClick={downloadCSV}
              className="flex items-center space-x-2 bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              <i className="fas fa-download"></i>
              <span>下載 CSV 紀錄</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 px-6 py-3 rounded-xl transition-all"
            >
              <i className="fas fa-print"></i>
              <span>列印分組結果</span>
            </button>
          </div>
        </div>
      )}

      {groups.length === 0 && participants.length > 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <i className="fas fa-users-viewfinder text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 font-medium">點擊上方按鈕開始自動分組</p>
        </div>
      )}
    </div>
  );
};

export default GroupingTool;
