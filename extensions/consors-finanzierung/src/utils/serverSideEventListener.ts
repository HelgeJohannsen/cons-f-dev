export type ServerSideEventHandler = (data: string) => void;

export class ServerSideEventListener {
  handlers: Record<string, ServerSideEventHandler | undefined>;

  constructor() {
    this.handlers = {};
  }

  setHandler(event: string, handler: ServerSideEventHandler | undefined) {
    this.handlers[event] = handler;
  }

  listen(url: string) {
    return fetch(url).then(async (response) => {
      console.log("SSEL CONNECTION ESTALISHED");
      const reader = response.body.getReader();
      let collected = "";
      while (true) {
        const { done, value } = await reader.read();
        const received = String.fromCharCode.apply(null, value);
        collected += received;
        //console.log("collected:", collected)
        const parts = collected.split("\n", 4);
        if (parts.length == 4) {
          const [rawEvent, rawData, _emptyLine, rest] = parts; // NOTE: data must be one line
          collected = rest;
          if (!rawEvent.startsWith("event: ")) {
            throw "unexpected event stream format";
          }
          const event = rawEvent.substring("event: ".length);

          if (!rawData.startsWith("data: ")) {
            throw "unexpected event stream format";
          }
          const data = rawData.substring("data: ".length);
          //console.log("event:", event, data, "\n\nRest:", rest)
          const handler = this.handlers[event];
          if (handler == undefined) {
            //  console.info(`no handler for event '${event}'`);
          } else {
            handler(data);
          }
        }
        if (done) {
          // https://replied-cup-edit-humanitarian.trycloudflare.com/api/public/notify/${uuid}
          break;
        }
      }
    });
  }
}
