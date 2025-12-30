import { initDatabase } from "./queries";
import fs from "node:fs";
import { CONST, execFileAsync } from "./utils";

export const initializeDatabase = () => {
  if (!fs.existsSync(CONST.DB_PATH)) {
    console.log(">>> creating file", CONST.DB_PATH);
    fs.closeSync(fs.openSync(CONST.DB_PATH, "a"));

    execFileAsync("sqlite3", [CONST.DB_PATH, initDatabase()], { encoding: "utf8" }).then((res) => {
      console.log(">>> Database initialized", res);
    });
  }
};
