import 'dotenv/config';

export default ({ config }) => {
  const client = process.env.CLIENT; 

  const clientConfigs = {
    jpont: {
      name: 'Jpont',
      android: { package: 'com.okron.app' },
      logo: './assets/logo.png'
    },
    kolder: {
      name: 'Kolder',
      android: { package: 'com.okron.clienteB' },
      logo: './assets/clienteB-logo.png'
    }
  };

  return {
    ...config,
    name: clientConfigs[client].name,
    android: clientConfigs[client].android,
    splash: { image: clientConfigs[client].logo }
  };
};
