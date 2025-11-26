// apps/api/src/admin/components.ts
import { ComponentLoader } from "adminjs";
import path from "path";

export const componentLoader = new ComponentLoader();

export const Components = {
  GardenImage: componentLoader.add(
    "GardenImage",
    // absolute path to the compiled component
    // e.g. C:\mood-gardens\apps\api\dist\admin\GardenImage.js
    path.resolve(process.cwd(), "dist/admin/GardenImage.js"),
  ),
};
