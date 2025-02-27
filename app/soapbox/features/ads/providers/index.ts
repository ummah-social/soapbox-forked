import { getSoapboxConfig } from 'soapbox/actions/soapbox';

import type { RootState } from 'soapbox/store';
import type { Card } from 'soapbox/types/entities';

/** Map of available provider modules. */
const PROVIDERS: Record<string, () => Promise<AdProvider>> = {
  soapbox: async() => (await import('./soapbox-config')).default,
  truth: async() => (await import('./truth')).default,
};

/** Ad server implementation. */
interface AdProvider {
  getAds(getState: () => RootState): Promise<Ad[]>
}

/** Entity representing an advertisement. */
interface Ad {
  /** Ad data in Card (OEmbed-ish) format. */
  card: Card
  /** Impression URL to fetch when displaying the ad. */
  impression?: string
  /** Time when the ad expires and should no longer be displayed. */
  expires_at?: string
  /** Reason the ad is displayed. */
  reason?: string
}

/** Gets the current provider based on config. */
const getProvider = async(getState: () => RootState): Promise<AdProvider | undefined> => {
  const state = getState();
  const soapboxConfig = getSoapboxConfig(state);
  const isEnabled = soapboxConfig.extensions.getIn(['ads', 'enabled'], false) === true;
  const providerName = soapboxConfig.extensions.getIn(['ads', 'provider'], 'soapbox') as string;

  if (isEnabled && PROVIDERS[providerName]) {
    return PROVIDERS[providerName]();
  }
};

export { getProvider };
export type { Ad, AdProvider };
