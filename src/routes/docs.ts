import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const file = fs.readFileSync(path.join(process.cwd(), 'openapi/leopard-api.v1.yaml'), 'utf8');
const spec = YAML.parse(file);

const r = Router();
r.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
export default r;
