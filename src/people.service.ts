import { v4 as uuidv4 } from 'uuid';
import { getTraversalSource } from './gremlinClient.js';

export type Person = {
  id: string;
  name: string;
  email: string;
};

export async function createPerson(name: string, email: string): Promise<Person> {
  const id = uuidv4();
  const g = getTraversalSource();
  await g
    .addV('Person')
    .property('id', id)
    .property('name', name)
    .property('email', email)
    .next();
  return { id, name, email };
}

export async function getPersonById(id: string): Promise<Person | null> {
  const g = getTraversalSource();
  const results = await g.V().has('Person', 'id', id).valueMap(true).toList();
  if (!results.length) return null;
  const vm = results[0] as Map<string, any>;
  const idVal = (vm.get('id') as string) ?? String(vm.get('~id') ?? id);
  const nameArr = vm.get('name') as string[] | undefined;
  const emailArr = vm.get('email') as string[] | undefined;
  return {
    id: idVal,
    name: nameArr ? nameArr[0] : '',
    email: emailArr ? emailArr[0] : '',
  };
}

export async function linkPersons(sourceId: string, targetId: string, relation: string = 'KNOWS'): Promise<boolean> {
  const g = getTraversalSource();
  await g
    .V().has('Person', 'id', sourceId)
    .addE(relation)
    .to(g.V().has('Person', 'id', targetId))
    .next();
  return true;
}

