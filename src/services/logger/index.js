import intel from 'intel';

export default function setup(options, imports) {

  // remove default console handler
  intel.config({ handlers: {} });

  const logger = intel.getLogger();

  options.transports.forEach(transport => {
    if (!('timestamp' in transport)) {
      transport.timestamp = true;
    }

    const formatter = new intel.Formatter({
      format: (transport.timestamp ? '[%(date)s] ' : '') +
        '%(name)s %(levelname)s: %(message)s',
      datefmt: '%Y-%m-%dT%H:%M:%S.%L%z',
      colorize: transport.colorize
    });

    switch (transport.name) {
      case 'file': {
        logger.addHandler(new intel.handlers.File({
          file: transport.filename,
          formatter: formatter
        }));
        break;
      }

      case 'stream': {
        logger.addHandler(new intel.handlers.Stream({
          stream: transport.filename,
          formatter: formatter
        }));
        break;
      }

      case 'console': {
        logger.addHandler(new intel.handlers.Console({ formatter: formatter }));
        break;
      }

      default:
        throw new Error(`Invalid transport name "${transport.name}"`);
    }
  });

  return logger;

}
