import { useSyncExternalStore } from 'react';
// One in-memory selection for the home rate cards and daily comparison.
let selected = '0';
const listeners = new Set();
const subscribe = (listener) => { listeners.add(listener); return () => { listeners.delete(listener); if (listeners.size === 0) selected = '0'; }; };
const getSnapshot = () => selected;
export default function useCardFee() {
  const fee = useSyncExternalStore(subscribe, getSnapshot, () => '0');
  return [fee, (value) => {
    if (!['0', '2.7', '3'].includes(value)) return;
    selected = value;
    listeners.forEach(listener => listener());
  }];
}
