import * as React from 'react';
import { ActionButton } from 'argo-ui/v2';

const pollingRates: { [key: string]: number } = {
  '5s': 5000,
  '10s': 10000,
  '30s': 30000,
  '1m': 60000,
  '5m': 300000,
};

interface PollProp {
  pollRate: number;
  setPollRate: (num: number) => void;
  resetPollRate: () => void;
}

export function PollWidget({ pollRate, setPollRate, resetPollRate }: PollProp) {
  return (
    <form className='poll-rate'>
      <label htmlFor='polling-rate-input' className='poll-rate__label'>
        <h2>Poll Rate</h2>
        <b>WARNING</b> Please minimize setting to the lower poll rate (eg. 5s, 10s) to avoid Jenkins disruption
      </label>
      <div className='poll-rate__inputs'>
        <select id='polling-rate-input' value={pollRate} onChange={e => setPollRate(parseInt(e.target.value))}>
          {Object.keys(pollingRates).map(pr => (
            <option key={pr} value={pollingRates[pr]}>
              {pr}
            </option>
          ))}
        </select>
        <ActionButton action={resetPollRate} label='Stop Polling' disabled={pollRate === null} />
      </div>
    </form>
  );
}
