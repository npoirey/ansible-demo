import {Server} from './server.class';
import {HeroRouter} from "./routes/hero.routes";

let app = new Server(80);
app.addRoute('/app', HeroRouter);
app.start();
