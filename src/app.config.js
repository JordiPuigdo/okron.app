import 'dotenv/config';

export default ({ config }) => {
  const client = process.env.CLIENT; 

  const clientConfigs = {
    jpont: {
      name: 'Jpont',
      android: { package: 'com.okron.jpont' },
      logo: './assets/logo.png'
    },
    kolder: {
      name: 'Kolder',
      android: { package: 'com.okron.kolder' },
      logo: './assets/kolder.png'
    }
  };

  return {
    ...config,
    name: clientConfigs[client].name,
    android: clientConfigs[client].android,
    splash: { image: clientConfigs[client].logo }
  };
};
