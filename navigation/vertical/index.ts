import dashboard from "./dashboard";
import order from "./order";
import management from "./management";
import type { VerticalNavItems } from "@layouts/types";

export default [...dashboard, ...order, ...management] as VerticalNavItems;
