import * as Express from 'express';
import * as BodyParser from 'body-parser';

export class Server {
    private app: Express.Application;
    private port: number;

    constructor(port: number) {
        this.port = port;
        this.app = Express();
        this.app.use(BodyParser.urlencoded({extended: false}));
        this.app.use(this.nocache)
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log('server started on port ' + this.port);
        });
    }

    getPort(): number {
        return this.port;
    }

    addRoute(mountPoint: string, router: Express.Router) {
        this.app.use(mountPoint, router);
    }

    nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }
}
