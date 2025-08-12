import { Router } from 'express';
import { rateLogin } from '../../middlewares/security';
import * as ctrl from './controller';

const r = Router();
r.post('/login', rateLogin, ctrl.login);
r.post('/refresh', ctrl.refresh);
r.post('/logout', ctrl.logout);
export default r;
