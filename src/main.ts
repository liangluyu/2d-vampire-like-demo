import "./styles.css";
import { Game } from "./core/Game";

const mount = document.getElementById("app");

if (!mount) {
  throw new Error("Missing #app mount element");
}

const game = new Game(mount);
void game.init();
