import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const readSimulator = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ host: z.string().min(1), port: z.number().int().min(1).max(65535) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { readSimulatorMeasurements } = await import("./simTcp.server");
    const measurements = await readSimulatorMeasurements(data.host, data.port);
    return { measurements, timestamp: Date.now() };
  });
