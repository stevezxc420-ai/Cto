export type ApiProvider = 'stripe' | 'twilio' | 'sendgrid' | 'aws' | 'slack';

export const API_PROVIDERS: ApiProvider[] = ['stripe', 'twilio', 'sendgrid', 'aws', 'slack'];

interface ValidationRule {
  pattern: RegExp;
  description: string;
}

const VALIDATION_RULES: Record<ApiProvider, ValidationRule> = {
  stripe: {
    pattern: /^(sk_test_|sk_live_|rk_test_|rk_live_)[a-zA-Z0-9]{24,}$/,
    description: 'Stripe API key must start with sk_test_, sk_live_, rk_test_, or rk_live_'
  },
  twilio: {
    pattern: /^SK[a-f0-9]{32}$|^AC[a-f0-9]{32}$/,
    description: 'Twilio API key must start with SK or AC followed by 32 hexadecimal characters'
  },
  sendgrid: {
    pattern: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/,
    description: 'SendGrid API key must start with SG. followed by specific format'
  },
  aws: {
    pattern: /^AKIA[A-Z0-9]{16}$/,
    description: 'AWS Access Key ID must start with AKIA followed by 16 alphanumeric characters'
  },
  slack: {
    pattern: /^xox[abprs]-[a-zA-Z0-9-]+$/,
    description: 'Slack token must start with xoxb-, xoxa-, xoxp-, xoxr-, or xoxs-'
  }
};

export class ValidationService {
  static validateApiKey(provider: ApiProvider, apiKey: string): { valid: boolean; error?: string } {
    const rule = VALIDATION_RULES[provider];
    
    if (!rule) {
      return { valid: false, error: `Unknown provider: ${provider}` };
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return { valid: false, error: 'API key cannot be empty' };
    }

    if (!rule.pattern.test(apiKey)) {
      return { valid: false, error: `Invalid ${provider} API key format. ${rule.description}` };
    }

    return { valid: true };
  }

  static isValidProvider(provider: string): provider is ApiProvider {
    return API_PROVIDERS.includes(provider as ApiProvider);
  }
}
