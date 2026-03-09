declare module 'gamedig' {
    export interface GameDigOptions {
        type: string;
        host: string;
        port?: number;

        [key: string]: any;
    }

    export interface GameDigState {
        name: string;
        map: string;
        password: boolean;
        numplayers: number;
        maxplayers: number;
        players: Array<{
            name: string;
            team: string;
            score: number;
            ping: number;
            raw: any;
        }>;
        bots: Array<{
            name: string;
            team: string;
            score: number;
            ping: number;
            raw: any;
        }>;
        version: string;
        protocol: number;
        hostname: string;
        port: number;
        ping: number;
        raw: any;
    }

    export class GameDig {
        static query(options: GameDigOptions): Promise<GameDigState>;
    }
}
