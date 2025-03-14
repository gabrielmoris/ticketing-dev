import nats, { Stan } from "node-nats-streaming";

// Singleton Pattern (1 used everywere)
class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access Nats client before connecting");
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("connected to NATS");
        resolve();
      });

      this.client.on("error", (e) => {
        reject(e);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
