interface CompanyConfig {
  COMPANY_NAME: string;
  COMPANY_BOT_NAME: string;
  COMPANY_LOGO: string;
}

// Default configuration
const defaultConfig: CompanyConfig = {
  COMPANY_NAME: 'Agentic Weaver',
  COMPANY_BOT_NAME: 'ODIN',
  COMPANY_LOGO: '/aw_logo_v1_fav_icon.png'
};

export const getCompanyName = (): string => {
  return defaultConfig.COMPANY_NAME;
};

export const getCompanyBotName = (): string => {
  return defaultConfig.COMPANY_BOT_NAME;
};

export const getCompanyLogo = (): string => {
  return defaultConfig.COMPANY_LOGO;
};