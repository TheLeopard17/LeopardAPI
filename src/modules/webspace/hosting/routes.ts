import { Router } from "express";
import { getList, syncNow, getOne } from "./controller";
import { auth } from "../../../middlewares/auth";
import { requireCompany } from "../../../middlewares/tenant";

const r = Router();
r.get("/", auth, requireCompany, getList);
r.post("/sync", auth, requireCompany, syncNow);
r.get("/:id", auth, requireCompany, getOne);

export default r;
