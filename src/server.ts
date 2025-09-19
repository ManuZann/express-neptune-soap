import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import fs from 'fs';
import path from 'path';
import soap from 'soap';
import { fileURLToPath } from 'url';
import { healthRouter } from './health.js';
import { createPerson, getPersonById, linkPersons } from './people.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Health endpoint
app.use(healthRouter);

// Serve WSDL at /wsdl
const wsdlPath = path.join(__dirname, '..', 'src', 'wsdl', 'people-v1.wsdl');
app.get('/wsdl', (_req, res) => {
  const wsdlXml = fs.readFileSync(wsdlPath, 'utf8');
  res.setHeader('Content-Type', 'text/xml');
  res.send(wsdlXml);
});

// SOAP service definition corresponding to WSDL
const serviceDef = {
  PeopleService: {
    PeopleServicePort: {
      CreatePerson: async (args: { name: string; email: string }) => {
        const person = await createPerson(args.name, args.email);
        return { person };
      },
      GetPersonById: async (args: { id: string }) => {
        const person = await getPersonById(args.id);
        if (!person) {
          return { person: { id: args.id, name: '', email: '' } };
        }
        return { person };
      },
      LinkPersons: async (args: { sourceId: string; targetId: string; relation?: string }) => {
        const ok = await linkPersons(args.sourceId, args.targetId, args.relation || 'KNOWS');
        return { ok };
      },
    },
  },
};

// Attach SOAP listener
const wsdlXml = fs.readFileSync(wsdlPath, 'utf8');
soap.listen(app as any, '/soap', serviceDef as any, wsdlXml);

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

