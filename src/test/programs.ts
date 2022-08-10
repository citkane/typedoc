import { deepStrictEqual as equal } from "assert";
import { join } from "path";
import * as ts from "typescript";
import {
    Application,
    EntryPointStrategy,
    SourceReference,
    TSConfigReader,
} from "..";
import { ApplicationEvents } from "../lib/application-events";
import type { ModelToObject } from "../lib/serialization/schema";

let converterApp: Application | undefined;
let converterProgram: ts.Program | undefined;
let converter2App: Application | undefined;
let converter2Program: ts.Program | undefined;

export function getConverterBase() {
    return join(process.cwd(), "src/test/converter");
}

export function getConverterApp() {
    if (!converterApp) {
        converterApp = new Application();
        converterApp.on(ApplicationEvents.READER_INIT, (_app:Application, readers: TSConfigReader[]) =>
            readers.push(new TSConfigReader())
        );
        converterApp.bootstrap({
            logger: "none",
            name: "typedoc",
            excludeExternals: true,
            disableSources: false,
            tsconfig: join(getConverterBase(), "tsconfig.json"),
            externalPattern: ["**/node_modules/**"],
            plugin: [],
            entryPointStrategy: EntryPointStrategy.Expand,
            gitRevision: "fake",
        });

        converterApp.serializer.addSerializer({
            priority: -1,
            supports(obj) {
                return obj instanceof SourceReference;
            },
            toObject(
                ref: SourceReference,
                obj: ModelToObject<SourceReference>,
                _serializer
            ) {
                if (obj.url) {
                    obj.url = `typedoc://${obj.url.substring(
                        obj.url.indexOf(ref.fileName)
                    )}`;
                }
                return obj;
            },
        });
    }

    return converterApp;
}

export function getConverterProgram() {
    if (!converterProgram) {
        const app = getConverterApp();
        converterProgram = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(converterProgram);
        equal(errors, []);
    }
    return converterProgram;
}

export function getConverter2Base() {
    return join(process.cwd(), "src/test/converter2");
}

export function getConverter2App() {
    if (!converter2App) {
        converter2App = new Application();
        converter2App.on(ApplicationEvents.READER_INIT, (_app: Application, readers: TSConfigReader[]) =>
            readers.push(new TSConfigReader())
        );
        converter2App.bootstrap({
            excludeExternals: true,
            tsconfig: join(getConverter2Base(), "tsconfig.json"),
            plugin: [],
            validation: true,
        });
    }
    return converter2App;
}

export function getConverter2Program() {
    if (!converter2Program) {
        const app = getConverter2App();
        converter2Program = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(converter2Program);
        equal(errors, []);
    }

    return converter2Program;
}
