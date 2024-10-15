import queryString from "query-string";

const log = (type, config) => {
  if (process.env.NODE_ENV == "production") return;

  const url = new URL(`https://${config.url}`);
  const query = queryString.parse(url.search);

  const args = [
    `%c ${config.method.toUpperCase()} ${type} %c ${url.pathname}`,
    `color: ${config.color ? config.color : type === "->" ? "#fadfa3" : "#0dbc79"}; background: #333; padding:5px;`,
    `background: ${config.color ? config.color : type === "->" ? "#fadfa3" : "#0dbc79"}; color: #333; padding:5px;`,
  ];

  if (type === "->" && (config.params || query)) {
    args.push({
      ...(config.params || {}),
      ...query,
    });
  }

  if (config.data) args.push(config.data);
  console.log(...args);
};

export default log;
