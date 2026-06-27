import { Router } from "express";
import { getCustomer, createCustomer, updateCustomer, deleteCustomer, getSingleCustomer } from "../../controller/admin/customer.controller.js";
import { createCustomerAddress, deleteCustomerAddress, getCustomerAddresses, updateCustomerAddress } from "../../controller/admin/customerAddress.controller.js";
import { createCustomerLedgerEntry, getCustomerLedger } from "../../controller/admin/ledger.controller.js";
import { validator } from "../../libraries/validator.js";
import { customerStorage } from "../storages.js";

const router = Router();

router.post("/customers", customerStorage.single("image"), validator("customer"), createCustomer);
router.put("/customers/:id", customerStorage.single("image"), validator("customer"), updateCustomer);
router.delete("/customers/:id", deleteCustomer);
router.get("/customers/:id", getSingleCustomer);
router.get("/customers", getCustomer);
router.get("/customers/:id/addresses", getCustomerAddresses);
router.post("/customers/:id/addresses", validator("customer-address"), createCustomerAddress);
router.put("/customers/:id/addresses/:addressId", validator("customer-address-update"), updateCustomerAddress);
router.delete("/customers/:id/addresses/:addressId", deleteCustomerAddress);
router.get("/customers/:id/ledger", getCustomerLedger);
router.post("/customers/:id/ledger", validator("customer-ledger"), createCustomerLedgerEntry);

export default router;
