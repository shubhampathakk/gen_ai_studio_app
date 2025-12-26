import Database from "better-sqlite3";
import path from "path";

export const db = new Database("onedata.db");

export function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      technical_name TEXT NOT NULL,
      type TEXT NOT NULL, -- CUBE, DSO, ADSO, HCPR, DATASOURCE
      description TEXT,
      deployment_status TEXT DEFAULT 'PENDING' -- PENDING, DEPLOYED
    );

    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL, -- TRANSFORMATION, DTP
      FOREIGN KEY(source_id) REFERENCES nodes(id),
      FOREIGN KEY(target_id) REFERENCES nodes(id)
    );

    CREATE TABLE IF NOT EXISTS abap_routines (
      id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL,
      routine_type TEXT, -- START, END, EXPERT
      abap_code TEXT,
      converted_sql TEXT,
      status TEXT DEFAULT 'PENDING', -- PENDING, CONVERTED, VERIFIED
      FOREIGN KEY(node_id) REFERENCES nodes(id)
    );
  `);

  // Seed data if empty
  const count = db.prepare("SELECT count(*) as c FROM nodes").get() as { c: number };
  if (count.c === 0) {
    console.log("Seeding database...");
    seedData();
  }
}

function seedData() {
  const nodes = [
    { id: "n1", technical_name: "0FIGL_C01", type: "CUBE", description: "General Ledger (New)" },
    { id: "n2", technical_name: "0FIGL_O02", type: "ADSO", description: "GL Line Items (DSO)" },
    { id: "n3", technical_name: "0FI_GL_14", type: "DATASOURCE", description: "GL Line Items Source" },
    { id: "n4", technical_name: "ZSALES_HCPR", type: "HCPR", description: "Sales Composite Provider" },
    { id: "n5", technical_name: "ZSD_O01", type: "ADSO", description: "Sales Orders DSO" },
    { id: "n6", technical_name: "2LIS_11_VAHDR", type: "DATASOURCE", description: "Sales Order Header" },
    { id: "n7", technical_name: "2LIS_11_VAITM", type: "DATASOURCE", description: "Sales Order Item" },
  ];

  const edges = [
    { id: "e1", source_id: "n2", target_id: "n1", type: "TRANSFORMATION" },
    { id: "e2", source_id: "n3", target_id: "n2", type: "TRANSFORMATION" },
    { id: "e3", source_id: "n5", target_id: "n4", type: "UNION" },
    { id: "e4", source_id: "n6", target_id: "n5", type: "TRANSFORMATION" },
    { id: "e5", source_id: "n7", target_id: "n5", type: "TRANSFORMATION" },
  ];

  const routines = [
    {
      id: "r1",
      node_id: "n2", // Routine on the DSO
      routine_type: "EXPERT",
      abap_code: `
LOOP AT SOURCE_PACKAGE ASSIGNING <SOURCE_FIELDS>.
  READ TABLE lt_currency INTO ls_curr
    WITH KEY curr_key = <SOURCE_FIELDS>-currency
             valid_date = <SOURCE_FIELDS>-doc_date BINARY SEARCH.
  IF sy-subrc = 0.
    <SOURCE_FIELDS>-amount_usd = <SOURCE_FIELDS>-amount_loc * ls_curr-rate.
  ELSE.
    <SOURCE_FIELDS>-amount_usd = 0.
  ENDIF.
ENDLOOP.
      `
    },
    {
      id: "r2",
      node_id: "n5",
      routine_type: "START",
      abap_code: `
LOOP AT SOURCE_PACKAGE ASSIGNING <fs_source>.
  IF <fs_source>-doc_type = 'ZRET'.
    DELETE SOURCE_PACKAGE.
    CONTINUE.
  ENDIF.
  CONCATENATE <fs_source>-sales_org <fs_source>-dist_channel INTO <fs_source>-org_key.
ENDLOOP.
      `
    }
  ];

  const insertNode = db.prepare("INSERT INTO nodes (id, technical_name, type, description) VALUES (?, ?, ?, ?)");
  const insertEdge = db.prepare("INSERT INTO edges (id, source_id, target_id, type) VALUES (?, ?, ?, ?)");
  const insertRoutine = db.prepare("INSERT INTO abap_routines (id, node_id, routine_type, abap_code) VALUES (?, ?, ?, ?)");

  nodes.forEach(n => insertNode.run(n.id, n.technical_name, n.type, n.description));
  edges.forEach(e => insertEdge.run(e.id, e.source_id, e.target_id, e.type));
  routines.forEach(r => insertRoutine.run(r.id, r.node_id, r.routine_type, r.abap_code));
}
