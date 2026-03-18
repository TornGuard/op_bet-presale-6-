/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, ArrowRight, CheckCircle2, Terminal, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [showPresale, setShowPresale] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'btc' | 'usdc'>('btc');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [opAddress, setOpAddress] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [filledSpots, setFilledSpots] = useState(1);

  useEffect(() => {
    const q = query(collection(db, 'submissions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFilledSpots(snapshot.docs.length);
    }, (error) => {
      console.error("Failed to fetch submissions", error);
    });

    return () => unsubscribe();
  }, []);

  const btcAddress = "bc1ptexjwyn83gl0e5j5jlf89f4gtcfn4cqrrjlw8jrkkxtzjwcl8drq09k6h4";
  const usdcAddress = "0x755EbFE16FFC822A0d46180b63B238f70e711ce3";

  const handleCopy = () => {
    const addressToCopy = paymentMethod === 'btc' ? btcAddress : usdcAddress;
    navigator.clipboard.writeText(addressToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitStatus('submitting');
    
    try {
      await addDoc(collection(db, 'submissions'), {
        txHash,
        op20Address: opAddress,
        timestamp: new Date().toISOString()
      });
      
      setSubmitStatus('success');
      setTxHash('');
      setOpAddress('');
    } catch (err) {
      console.error("Submission failed", err);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        <header className="flex flex-col items-center mb-6 text-center">
          <div className="font-mono font-extrabold text-3xl md:text-5xl text-accent flex items-center gap-3 mb-2 tracking-tight">
            <span className="text-xl md:text-3xl">◈</span>
            OP_BET
          </div>
          <p className="text-dim text-sm md:text-base font-mono uppercase tracking-widest">
            Bet on the Mempool
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!showPresale ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowPresale(true)}
                  className="group relative flex flex-col items-center justify-center p-8 bg-bg2 border border-border rounded-xl hover:border-accent transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Terminal className="w-8 h-8 text-accent mb-4" />
                  <span className="font-mono font-bold text-xl text-text mb-2 uppercase tracking-wider">Presale</span>
                  <span className="text-dim text-sm text-center">Join the early funding round</span>
                </button>

                <a 
                  href="https://op-bet.vercel.app/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-center p-8 bg-bg2 border border-border rounded-xl hover:border-green transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ExternalLink className="w-8 h-8 text-green mb-4" />
                  <span className="font-mono font-bold text-xl text-text mb-2 uppercase tracking-wider">Testnet DApp</span>
                  <span className="text-dim text-sm text-center">Try the beta on testnet</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <a 
                  href="https://op-bet.vercel.app" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-bg3 border border-border rounded-xl hover:bg-border transition-colors text-dim hover:text-text font-mono text-sm uppercase tracking-wider"
                >
                  View Pitch Deck <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="https://t.me/+jXM7rb2VTc40Mzk1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-[#2AABEE]/10 border border-[#2AABEE]/20 rounded-xl hover:bg-[#2AABEE]/20 transition-colors text-[#2AABEE] font-mono text-sm uppercase tracking-wider"
                >
                  Join Telegram <Send className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="presale"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-bg2 border border-border rounded-2xl p-4 md:p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-hot to-accent" />
              
              <button 
                onClick={() => setShowPresale(false)}
                className="text-dim hover:text-text font-mono text-sm mb-4 flex items-center gap-2 transition-colors"
              >
                ← Back
              </button>

              <div className="space-y-4">
                <div>
                  <h2 className="font-mono font-bold text-xl text-text mb-1 uppercase tracking-wide">Strategic Presale</h2>
                  <p className="text-dim text-sm leading-relaxed">
                    10 rounds of presale, each grants 1% of supply. <br/>
                    <strong className="text-accent font-mono text-base mt-1 inline-block">Presale • 10% of the supply</strong>
                  </p>
                </div>

                <div className="bg-bg3 border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-dim uppercase tracking-wider">Presale Rounds</span>
                    <span className="bg-green/10 text-green font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Live</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-mono text-[10px] text-dim uppercase tracking-wider">Presale Status</span>
                      <span className="font-mono text-xs font-bold text-accent">{Math.round((filledSpots / 10) * 100)}% filled</span>
                    </div>
                    <div className="h-1.5 w-full bg-bg border border-border rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((filledSpots / 10) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {[
                      { round: 1, price: 100 },
                      { round: 2, price: 200 },
                      { round: 3, price: 400 },
                      { round: 4, price: 600 },
                      { round: 5, price: 800 },
                      { round: 6, price: 1000 },
                      { round: 7, price: 1100 },
                      { round: 8, price: 1200 },
                      { round: 9, price: 1300 },
                      { round: 10, price: 1400 }
                    ].map(({ round, price }) => (
                      <div key={round} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                        filledSpots >= round 
                          ? 'bg-green/10 border-green/30' 
                          : 'bg-bg border-border hover:border-accent/50'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-dim uppercase">Round {round}</span>
                          {filledSpots >= round && <span className="bg-green/20 text-green font-mono text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Active</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-text font-bold">${price}</span>
                          <span className="font-mono text-[10px] text-dim">1%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setPaymentMethod('btc')}
                        className={`flex-1 font-mono text-xs uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border ${
                          paymentMethod === 'btc'
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-bg border-border text-dim hover:border-accent/50'
                        }`}
                      >
                        BTC
                      </button>
                      <button
                        onClick={() => setPaymentMethod('usdc')}
                        className={`flex-1 font-mono text-xs uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border ${
                          paymentMethod === 'usdc'
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-bg border-border text-dim hover:border-accent/50'
                        }`}
                      >
                        USDC (All EVM)
                      </button>
                    </div>
                    <label className="font-mono text-[10px] text-dim uppercase tracking-wider">
                      Send {paymentMethod === 'btc' ? 'BTC' : 'USDC'} to
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-bg border border-border rounded-lg p-2 font-mono text-xs text-accent break-all">
                        {paymentMethod === 'btc' ? btcAddress : usdcAddress}
                      </code>
                      <button 
                        onClick={handleCopy}
                        className="bg-accent hover:bg-[#ffaa33] text-black p-2 rounded-lg transition-colors flex-shrink-0"
                        title="Copy Address"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-bg3 border border-border rounded-xl p-4">
                  <h3 className="font-mono text-xs text-text uppercase tracking-wider mb-3">Confirm Your Spot</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Transaction Hash (TX)</label>
                      <input 
                        type="text" 
                        required
                        value={txHash}
                        onChange={e => setTxHash(e.target.value)}
                        placeholder="e.g. 5f8a..." 
                        className="w-full bg-bg border border-border rounded-lg p-2 font-mono text-xs text-text focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Your OP20 Address</label>
                      <input 
                        type="text" 
                        required
                        value={opAddress}
                        onChange={e => setOpAddress(e.target.value)}
                        placeholder="e.g. bc1q..." 
                        className="w-full bg-bg border border-border rounded-lg p-2 font-mono text-xs text-text focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={submitStatus === 'submitting' || submitStatus === 'success'}
                      className="w-full bg-accent hover:bg-[#ffaa33] text-black font-mono font-bold text-sm uppercase tracking-wider p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                      {submitStatus === 'submitting' ? 'Submitting...' : 
                       submitStatus === 'success' ? 'Spot Confirmed! ✓' : 
                       'Submit Details'}
                    </button>
                    
                    {submitStatus === 'error' && (
                      <p className="text-red font-mono text-[10px] mt-1">Failed to submit. Please try again.</p>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
