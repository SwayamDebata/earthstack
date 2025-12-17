'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapContainer from '@/components/MapContainer';
import RiskCard from '@/components/RiskCard';
import { motion } from 'framer-motion';
import Skeleton from '@/components/ui/Skeleton';
import ScenarioBuilder, { ScenarioParams } from '@/components/ScenarioBuilder';
import { Settings2 } from 'lucide-react';

export default function FloodPredictPage() {
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(0);
  const [isScenarioBuilderOpen, setIsScenarioBuilderOpen] = useState(false);

  useEffect(() => {
    fetch('/api/mock/predict')
      .then((res) => res.json())
      .then((data) => {
        setPredictions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching predictions:', error);
        setLoading(false);
      });
  }, []);

  const handleApplyScenario = (params: ScenarioParams) => {
      // In a real app, we would re-fetch predictions with these params
      console.log("Applying scenario params:", params);
      setGenerating(true);
      setTimeout(() => {
          setGenerating(false);
          alert(`Scenario Applied: Rainfall ${params.rainfallIntensity}% | Blockage ${params.drainageBlockage}%`);
      }, 2000);
  };

  const handleGeneratePrediction = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      // Simulate new prediction
      alert('New prediction generated! (Demo mode)');
    }, 2000);
  };

  const currentPrediction = predictions?.predictions[selectedPrediction];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Map Container with Flood Zones */}
          <div className="absolute inset-0">
            <MapContainer
              className="w-full h-full"
              layers={{ rainfall: false, riverLevels: false, floodZones: true, clouds: false }}
            />
          </div>

          <ScenarioBuilder 
             isOpen={isScenarioBuilderOpen}
             onClose={() => setIsScenarioBuilderOpen(false)}
             onApply={handleApplyScenario}
          />

          {/* Right Panel - Risk Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-6 right-6 z-10 w-96 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-6 custom-scrollbar"
          >
            <div className="glass-card p-4 flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-bold gradient-text mb-1">Flood Prediction</h2>
                  <p className="text-sm text-gray-400">AI-powered risk assessment</p>
               </div>
               <button 
                onClick={() => setIsScenarioBuilderOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Configure Scenario"
               >
                   <Settings2 size={20} />
               </button>
            </div>

            {loading ? (
              <div className="glass-card p-6 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <>
                {/* Location Selector */}
                <div className="glass-card p-4">
                  <label className="text-sm text-gray-400 mb-2 block">Select Location</label>
                  <select
                    value={selectedPrediction}
                    onChange={(e) => setSelectedPrediction(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    {predictions?.predictions.map((pred: any, idx: number) => (
                      <option key={idx} value={idx} className="bg-[#0F1424]">
                        {pred.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Risk Card */}
                {currentPrediction && (
                  <RiskCard
                    riskLevel={currentPrediction.riskLevel}
                    confidence={currentPrediction.confidence}
                    location={currentPrediction.location}
                  />
                )}

                {/* Prediction Details */}
                {currentPrediction && (
                  <div className="glass-card p-4 space-y-4">
                    <h3 className="font-semibold text-white">Risk Factors</h3>
                    <ul className="space-y-2 text-sm">
                      {currentPrediction.factors.map((factor: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-gray-300">{factor}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Timeframe</span>
                        <span className="text-white">{currentPrediction.timeframe}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Affected Area</span>
                        <span className="text-white">{currentPrediction.affectedArea} km²</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Population at Risk</span>
                        <span className="text-white">{currentPrediction.population.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGeneratePrediction}
                  disabled={generating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent-end font-semibold hover:shadow-[0_0_20px_rgba(45,130,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Run Base Prediction'
                  )}
                </button>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
