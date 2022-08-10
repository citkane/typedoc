import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Application, EntryPointStrategy, TSConfigReader } from "../..";
import { ApplicationEvents } from "../../lib/application-events";

const fixture = tempdirProject();
fixture.addJsonFile("tsconfig.json", {
    include: ["."],
});
fixture.addJsonFile("package.json", {
    main: "index.ts",
});
fixture.addFile("index.ts", "export function fromIndex() {}");
fixture.addFile("extra.ts", "export function extra() {}");

describe.skip("Entry Points", () => {
    beforeEach(() => {
        fixture.write();
    });

    afterEach(() => {
        fixture.rm();
    });

    const app = new Application();
    const tsconfig = join(fixture.cwd, "tsconfig.json");
    app.on(
        ApplicationEvents.READER_INIT,
        (app, readers) => readers.push(new TSConfigReader())
    )

    it("Supports expanding existing paths", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            2,
            "There are two files, so both should be expanded"
        );
    });

    it("Supports expanding globs in paths", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [`${fixture.cwd}/*.ts`],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            2,
            "There are two files, so both should be expanded"
        );
    });

    it("Supports resolving directories", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Resolve,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            1,
            "entry-points/index.ts should have been the sole entry point"
        );
    });

    it("Supports resolving packages", () => {
        app.bootstrap({
            tsconfig: tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Packages,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(entryPoints.length, 1);
        equal(entryPoints[0].version, void 0);
    });
});
