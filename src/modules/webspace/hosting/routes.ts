import { Router } from "express";
import { getList, syncNow, getOne } from "./controller";

const r = Router();
r.get("/webspace/hosting", getList);
r.post("/webspace/hosting/sync", syncNow);
r.get("/webspace/hosting/:id", getOne);

export default r;
