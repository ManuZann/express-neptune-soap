import dotenv from 'dotenv';
import gremlin from 'gremlin';

const { driver, process: gprocess, structure } = gremlin;

dotenv.config();

const GREMLIN_ENDPOINT = process.env.GREMLIN_ENDPOINT || 'ws://gremlin:8182/gremlin';
const GREMLIN_TLS = (process.env.GREMLIN_TLS || 'false').toLowerCase() === 'true';

let sharedConnection: any = null;
let sharedGraph: any = null;

export function getTraversalSource() {
  if (!sharedConnection || !sharedGraph) {
    sharedConnection = new driver.DriverRemoteConnection(GREMLIN_ENDPOINT, {
      ssl: GREMLIN_TLS,
    });
    sharedGraph = new structure.Graph();
  }
  return sharedGraph.traversal().withRemote(sharedConnection);
}

export async function closeGremlin() {
  if (sharedConnection) {
    await sharedConnection.close();
    sharedConnection = null;
    sharedGraph = null;
  }
}

export const __gprocess = gprocess; // re-export if needed externally

