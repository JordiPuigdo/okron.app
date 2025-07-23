import Config from "@interfaces/Config";

class ConfigService {
  private readonly API = process.env.EXPO_PUBLIC_API_URL;

  // Caché interna: datos y promesa de carga
  private configData: Config | null = null;
  private loadingPromise: Promise<Config> | null = null;

  /**
   * Carga la configuración una sola vez y la guarda en caché.
   * Retorna la misma promesa si ya está en curso o devuelve el resultado caché.
   */
  async loadConfig(): Promise<Config> {
    if (this.configData) {
      return this.configData;
    }
    if (!this.loadingPromise) {
      this.loadingPromise = (async () => {
        const url = `${this.API}config`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch config");
        }
        const operators: Config =
          response.status === 204 ? [] : await response.json();
        this.configData = operators;
        return operators;
      })();
    }
    return this.loadingPromise;
  }

  /**
   * Acceso sincrónico a los datos caché. Lanzará error si aún no están cargados.
   */
  getConfigSync(): Config {
    /*if (!this.configData) {
      throw new Error(
          "Config not loaded yet. Ejecuta primero loadConfig() para inicializarla."
      );
    }
  }*/
    return this.configData;
  }
}

export const configService = new ConfigService();
