import path from 'path';
import { static as _static, Router as router } from 'express';

export default function setup(options, imports) {

  const assetsPath = path.resolve(options.assets || '.');

  const staticRouter = router();

  staticRouter.use(_static(assetsPath));

  staticRouter.use(function (req, res) {
    res.sendStatus(404).end();
  });

  return staticRouter;

}
