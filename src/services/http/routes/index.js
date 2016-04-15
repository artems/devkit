import path from 'path';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const assetsPath = path.resolve(options.assets || '.');

  const indexRouter = router();

  indexRouter.get('/', function (req, res) {
    res.sendFile(path.join(assetsPath, 'index.html'));
  });

  return indexRouter;

}
