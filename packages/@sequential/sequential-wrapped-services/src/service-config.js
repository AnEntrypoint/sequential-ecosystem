export function parseArgs(args) {
  const config = {
    basePort: 3100,
    services: null,
    runtime: 'auto',
    debug: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') {
      config.basePort = parseInt(args[++i]);
    } else if (args[i] === '--services') {
      config.services = args[++i].split(',');
    } else if (args[i] === '--deno') {
      config.runtime = 'deno';
    } else if (args[i] === '--node') {
      config.runtime = 'node';
    } else if (args[i] === '--bun') {
      config.runtime = 'bun';
    } else if (args[i] === '--debug') {
      config.debug = true;
    }
  }

  return config;
}

export function filterServices(allServices, config) {
  if (!config.services) {
    return allServices;
  }

  const filtered = {};
  for (const name of config.services) {
    if (allServices[name]) {
      filtered[name] = allServices[name];
    }
  }
  return filtered;
}

export function assignPorts(services, config) {
  const serviceNames = Object.keys(services).sort();
  const serviceArray = serviceNames.map((name, index) => {
    services[name].port = config.basePort + index;
    return services[name];
  });
  return serviceArray;
}
