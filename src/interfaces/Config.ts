interface Config {
  version: number;
  clientName: string;
  isCRM: boolean;
  wooConfiguration:{
    enableStartOperatorsWithWO: boolean
  },
  id: string,
  active: boolean,
  creationDate: string
}

export default Config;
