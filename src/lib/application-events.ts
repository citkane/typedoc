export const ApplicationEvents = {
    BEGIN: "begin",
    END: "end",
    READER_INIT: "readerInit",
    READER_PLUGINS: "readerPluginsStart",
    READER_PLUGINS_END: "readerPluginsEnd",
    READER_ARGS: "readerFinalArgs",
    READER_FINISHED: "readerFinished",
} as const;
