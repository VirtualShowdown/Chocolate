import { Client } from 'discord.js';
import { CommandBuilder, CommandCallback, DiscordEvents, EventCallback, PlayerEvents } from '../types';
import { DisTubeEvents } from 'distube';
import { Audioplayer } from './audioplayer';

export enum EventType {
    Discord = 'discord',
    Distube = 'distube',
    Audioplayer = 'audioplayer',
}

export interface Events {
    [EventType.Discord]: DiscordEvents;
    [EventType.Distube]: DisTubeEvents;
    [EventType.Audioplayer]: PlayerEvents;
}

export interface Event<
    T extends EventType,
    U extends keyof Events[T]
> {
    type: T;
    name: U;
    cb: EventCallback<T, U>;
}

export interface BaseCommand {
    permissions: bigint[];
    data: CommandBuilder;
}

export interface Command extends BaseCommand {
    data: CommandBuilder;
    cb: CommandCallback;
}

interface AppOptions {
    client: Client;
    audioplayer: Audioplayer;
    commands: Command[];
    events: Event<any, any>[];
}

export class App {
    public readonly client: Client;
    public readonly audioplayer: Audioplayer;
    public readonly commands: Command[];
    public readonly events: Event<any, any>[];

    constructor(options: AppOptions) {
        this.client = options.client;
        this.audioplayer = options.audioplayer;
        this.commands = options.commands;
        this.events = options.events;
    }

    public init() {
        this.registerEvents();
    }

    private registerEvents() {
        for (const { type, name, cb } of this.events) {
            switch (type) {
                case EventType.Discord:
                    this.client.on(name, (...args) => cb(this, ...args));
                    break;
                case EventType.Distube:
                    this.audioplayer.distube.on(name, (...args: any[]) => cb(this, ...args));
                    break;
                case EventType.Audioplayer:
                    this.audioplayer.emitter.on(name, (...args) => cb(this, ...args));
                    break;
            }
        }
    }

    public deployCommands() {
        const commands = this.commands.map(({ data }) => data);
        this.client.application?.commands.set(commands);
    }
}

export function createEvent<
    T extends EventType,
    U extends keyof Events[T]
>(event: Event<T, U>) {
    return event;
}

export function createCommand(command: Command) {
    return command;
}